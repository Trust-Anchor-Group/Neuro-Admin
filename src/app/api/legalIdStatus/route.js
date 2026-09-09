import ResponseModel from "@/models/ResponseModel";
import { hasNotificationRecipient, hasSessionCookie, sendIdentityNotificationEmail, VALID_IDENTITY_ACTIONS } from "@/lib/server/identityNotifications";
import { buildNeuronHeaders, readNeuronResponseBody } from '@/lib/neuronUpstream';
import { getActiveNeuronContext } from '@/lib/neuronSessionContext';

async function fetchNotificationUser({ id, host, upstreamCookieHeader }) {
    const response = await fetch(`https://${host}/legalIdentity.ws`, {
        method: 'POST',
        headers: buildNeuronHeaders({
            upstreamCookieHeader,
        }),
        body: JSON.stringify({ id }),
    });

    const { body } = await readNeuronResponseBody(response);

    if (!response.ok) {
        throw new Error(`Failed to fetch notification recipient: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
    }

    if (typeof body !== 'object' || body === null) {
        throw new Error('Notification recipient payload was not JSON');
    }

    return {
        properties: {
            FIRST: body.properties?.FIRST || '',
            ORGNAME: body.properties?.ORGNAME || '',
            EMAIL: body.properties?.EMAIL || '',
        },
    };
}

export async function POST(request) {
    try {
        const requestData = await request.json();
        const { id, state, user, reason, sendNotification = false } = requestData;
        const activeContext = await getActiveNeuronContext(request);
        const clientCookie = activeContext.upstreamCookieHeader || '';

        if (!hasSessionCookie(clientCookie)) {
            return new Response(JSON.stringify(new ResponseModel(401, 'Authentication required')), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        if (!id || !state) {
            return new Response(JSON.stringify(new ResponseModel(400, 'Missing required fields: id and state')), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        if (!VALID_IDENTITY_ACTIONS.has(state)) {
            return new Response(JSON.stringify(new ResponseModel(400, `Invalid identity action: ${state}`)), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const decodedUserId = decodeURIComponent(id);
        const dynamicHost = activeContext.host;
        const url = `https://${dynamicHost}/LegalIdentityStateChanged`;
        console.info('[identity-status] received state change request', {
            id: decodedUserId,
            state,
            host: dynamicHost,
            sendNotification,
            hasClientRecipient: hasNotificationRecipient(user),
        });

        const payload = {
            id: decodedUserId,
            state
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: buildNeuronHeaders({
                upstreamCookieHeader: clientCookie,
                accept: null,
            }),
            body: JSON.stringify(payload),
        });

        const { body: data } = await readNeuronResponseBody(response);

        if (!response.ok) {
            return new Response(JSON.stringify(new ResponseModel(response.status, `Error: ${data}`)), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        let notification = null;

        if (sendNotification) {
            try {
                const notificationUser = hasNotificationRecipient(user)
                    ? user
                    : await fetchNotificationUser({
                        id: decodedUserId,
                        host: dynamicHost,
                        upstreamCookieHeader: clientCookie,
                    });

                notification = await sendIdentityNotificationEmail({
                    action: state,
                    user: notificationUser,
                    reason,
                    neuronHost: dynamicHost,
                });

                if (!notification.success) {
                    console.error('[identity-status] notification failed after state change', {
                        id: decodedUserId,
                        state,
                        host: dynamicHost,
                        error: notification.error,
                        details: notification.details || null,
                    });
                } else {
                    console.info('[identity-status] notification sent after state change', {
                        id: decodedUserId,
                        state,
                        host: dynamicHost,
                    });
                }
            } catch (notificationError) {
                notification = {
                    success: false,
                    status: 500,
                    error: notificationError.message || 'Failed to prepare notification',
                };
                console.error('[identity-status] notification preparation failed', {
                    id: decodedUserId,
                    state,
                    host: dynamicHost,
                    error: notification.error,
                });
            }
        }

        return new Response(JSON.stringify(new ResponseModel(200, 'status of LegalID successfully changed', {
            stateChange: data,
            notification,
        })), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            }
        });

    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        return new Response(JSON.stringify(new ResponseModel(statusCode, message)), {
            status: statusCode,
            headers: {
                "Content-Type": "application/json"
            }
        }
        );
    }
}
