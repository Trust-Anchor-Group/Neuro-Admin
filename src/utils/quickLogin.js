import config from "@/config/config";

/**
 * =================================================================================================
 * @desc Fetches the service ID
 * =================================================================================================
 */
export const fetchServiceId = async ({ service, sessionId }) => {
    const { protocol, origin } = config;
    const url = `${protocol}://${origin}/api/auth/quickLogin/register`;
    const payload = {
        service,
        sessionId,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Error fetching service ID: ${response.statusText}`);
        }

        const responseData = await response.json();
        return responseData.data.serviceId;
    } catch (error) {
        throw new Error(error);
    }
};


/**
 * =================================================================================================
 * @desc Fetches the QR code
 * =================================================================================================
 */
export const fetchQrCode = async ({ serviceId, tabId, sessionId }) => {
    const { protocol, origin } = config;
    const url = `${protocol}://${origin}/api/auth/quickLogin/initiate`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serviceId, tabId, sessionId }),
        });

        if(!response.ok){
            throw new Error(`Error fetching QR code: ${response.statusText}`);
        }

        const responseData = await response.json();

        return responseData.data.src;
    } catch (error) {
        throw new Error(error);
    }
};


/**
 * =================================================================================================
 * @desc Requests the session to remain valid
 * =================================================================================================
 */
export const updateServiceIdSession = async ({ service, sessionId, serviceId }) => {
    const { protocol, origin } = config;
    const url = `${protocol}://${origin}/api/auth/quickLogin/refresh`;
    const payload = {
        service,
        sessionId,
        serviceId,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const responseData = await response.json();
    } catch (error) {
        throw new Error(error);
    }
};