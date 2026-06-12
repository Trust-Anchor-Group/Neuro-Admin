import config from "@/config/config";
import ResponseModel from "@/models/ResponseModel";
import { hasSessionCookie, sendIdentityNotificationEmail, VALID_IDENTITY_ACTIONS } from "@/lib/server/identityNotifications";
import { resolveAgentHost } from "@/lib/agentHost";

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
            notification = user?.properties?.EMAIL
                ? await sendIdentityNotificationEmail({ action: state, user, reason, neuronHost: dynamicHost })
                : { success: false, skipped: true, error: 'Missing recipient email' };
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
