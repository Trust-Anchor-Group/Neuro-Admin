import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";
import { hasNotificationRecipient, hasSessionCookie, sendIdentityNotificationEmail, VALID_IDENTITY_ACTIONS } from "@/lib/server/identityNotifications";
import { resolveAgentHost } from "@/lib/agentHost";

async function fetchNotificationUser({ id, host, clientCookie }) {
    const response = await fetch(`https://${host}/legalIdentity.ws`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': clientCookie,
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ id }),
        mode: 'cors'
    });

    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

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
        const clientCookie = request.headers.get('Cookie') || '';

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
        const dynamicHost = resolveAgentHost(request.headers) || config.api.agent.host;
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
            headers: {
                'Content-Type': 'application/json',
                'Cookie': clientCookie
            },
            credentials: 'include',
            body: JSON.stringify(payload),
            mode: 'cors'
        });

        const contentType = response.headers.get('content-type') || '';
        let data;

        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

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
                        clientCookie,
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
