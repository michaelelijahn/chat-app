
export const isValidUsername = (username: string) => {
    if (username.length < 3) {
        return {
            isValid: false,
            message: "Username must be at least 3 characters long",
        }
    }

    if (username.length > 16) {
        return {
            isValid: false,
            message: "Username exceeds 16 characters",
        }
    }

    const regex = /^[a-zA-Z0-9_]{3,16}$/;
    const isValid = regex.test(username);

    if (isValid) {
        return {
            isValid,
            message: "Username is valid",
        }
    }
    return {
        isValid: false,
        message: "Username can only contain letters, numbers, and underscores",
    }
}

interface AuthenticatedRequestParams {
    url: string;
    accessToken: string;
    options?: RequestInit;
}

export const authenticatedFetch = async ({ url, accessToken, options = {}} : AuthenticatedRequestParams) => {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (response.status === 401) {
            try {

                const refreshResponse = await fetch('/api/auth/refresh', {
                    method: 'POST',
                    credentials: 'include'
                });

                if (!refreshResponse.ok) {
                    throw new Error('Token refresh failed');
                }

                const { accessToken: newAccessToken } = await refreshResponse.json();

                const retryResponse = await fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${newAccessToken}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                return {
                    response: retryResponse,
                    newAccessToken
                };
            } catch (error) {
                window.location.href = '/login';
                throw new Error('Authentication failed');
            }
        }
        return { response };
    } catch (error) {
        console.error('Request error:', error);
        throw error;
    }
}