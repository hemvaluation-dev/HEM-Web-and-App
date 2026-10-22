// FCM HTTP v1 with a short-lived OAuth token. No Firebase paid services required.
export type ServiceAccount = {
    project_id: string;
    client_email: string;
    private_key: string;
};
export function parseAccount(raw: string): ServiceAccount {
    const value = JSON.parse(raw);
    if (!/^[a-z0-9-]+$/.test(value.project_id ?? '') || !value.client_email || !value.private_key?.includes('BEGIN PRIVATE KEY'))
        throw new Error('Invalid Firebase configuration');
    return value;
}
function base64url(bytes: Uint8Array) {
    return btoa(String.fromCharCode(...bytes)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
const encode = (value: unknown) => base64url(new TextEncoder().encode(JSON.stringify(value)));
export async function accessToken(account: ServiceAccount, request = fetch): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const unsigned = encode({ alg: 'RS256', typ: 'JWT' }) + '.' + encode({ iss: account.client_email, scope: 'https://www.googleapis.com/auth/firebase.messaging', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 });
    const pem = account.private_key.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
    const key = await crypto.subtle.importKey('pkcs8', Uint8Array.from(atob(pem), c => c.charCodeAt(0)), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
    const response = await request('https://oauth2.googleapis.com/token', { method: 'POST', signal: AbortSignal.timeout(10000), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: unsigned + '.' + base64url(new Uint8Array(signature)) }) });
    if (!response.ok)
        throw new Error('Firebase authentication unavailable');
    const result = await response.json();
    if (!result.access_token)
        throw new Error('Missing Firebase access token');
    return result.access_token;
}
export function assignmentMessage(event: {
    id: string;
    case_id: string;
}, token: string) {
    return { message: { token, notification: { title: 'New case assigned', body: 'A case has been assigned to you. Open HEM Agent to view it.' },
            data: { type: 'case_assigned', case_id: event.case_id, event_id: event.id },
            android: { priority: 'high', ttl: '86400s', collapse_key: event.case_id, notification: { tag: event.case_id, channel_id: 'case_assignments', icon: 'ic_notification', visibility: 'PRIVATE' } } } };
}
export function invalidToken(body: {
    error?: {
        details?: Array<{
            errorCode?: string;
        }>;
    };
}): boolean {
    return body.error?.details?.some(detail => detail.errorCode === 'UNREGISTERED') ?? false;
}
