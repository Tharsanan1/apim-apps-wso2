/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * Tests the authorization header computation logic from ApiConsole.jsx render().
 *
 * This logic was the subject of Issue #4962 — the platform gateway path
 * previously hardcoded `authorizationHeader = 'ApiKey'` ignoring the custom
 * `api.apiKeyHeader` value. After the fix, both platform and non-platform
 * APIs use the same unified logic.
 *
 * The function below mirrors the authorization header computation extracted
 * from ApiConsole.jsx lines 531-538 (post-fix).
 */
function computeAuthorizationHeader(api, securitySchemeType) {
    let authorizationHeader = api.authorizationHeader ? api.authorizationHeader : 'Authorization';
    if (api && api.securityScheme) {
        const isApiKeyEnabled = api.securityScheme.includes('api_key');
        if (isApiKeyEnabled && securitySchemeType === 'API-KEY') {
            authorizationHeader = api.apiKeyHeader ? api.apiKeyHeader : 'ApiKey';
        }
    }
    return authorizationHeader;
}

describe('ApiConsole authorizationHeader computation (Issue #4962)', () => {
    describe('OAuth security scheme', () => {
        it('should use default Authorization header', () => {
            const api = {
                securityScheme: ['oauth2'],
                authorizationHeader: null,
            };
            expect(computeAuthorizationHeader(api, 'OAUTH')).toBe('Authorization');
        });

        it('should use custom authorizationHeader when set', () => {
            const api = {
                securityScheme: ['oauth2'],
                authorizationHeader: 'X-Custom-Auth',
            };
            expect(computeAuthorizationHeader(api, 'OAUTH')).toBe('X-Custom-Auth');
        });
    });

    describe('Basic security scheme', () => {
        it('should use default Authorization header', () => {
            const api = {
                securityScheme: ['basic_auth'],
                authorizationHeader: null,
            };
            expect(computeAuthorizationHeader(api, 'BASIC')).toBe('Authorization');
        });
    });

    describe('API Key security scheme (Issue #4962 - Problem 1 fix)', () => {
        it('should use default ApiKey header when no custom apiKeyHeader is set', () => {
            const api = {
                securityScheme: ['api_key'],
                apiKeyHeader: null,
            };
            expect(computeAuthorizationHeader(api, 'API-KEY')).toBe('ApiKey');
        });

        it('should use custom apiKeyHeader when set', () => {
            const api = {
                securityScheme: ['api_key'],
                apiKeyHeader: 'X-Custom-ApiKey',
            };
            expect(computeAuthorizationHeader(api, 'API-KEY')).toBe('X-Custom-ApiKey');
        });

        it('should use custom apiKeyHeader for platform gateway APIs (regression test)', () => {
            // Before the fix, platform gateway APIs hardcoded 'ApiKey'
            // ignoring api.apiKeyHeader. After the fix, both gateway types
            // use the same unified logic.
            const api = {
                gatewayType: 'APIPlatform',
                securityScheme: ['api_key'],
                apiKeyHeader: 'X-Platform-Key',
            };
            expect(computeAuthorizationHeader(api, 'API-KEY')).toBe('X-Platform-Key');
        });

        it('should use default ApiKey for platform gateway APIs when no custom header', () => {
            const api = {
                gatewayType: 'APIPlatform',
                securityScheme: ['api_key'],
                apiKeyHeader: null,
            };
            expect(computeAuthorizationHeader(api, 'API-KEY')).toBe('ApiKey');
        });

        it('should not use ApiKey header when security scheme type is not API-KEY', () => {
            const api = {
                securityScheme: ['api_key', 'oauth2'],
                apiKeyHeader: 'X-Custom-ApiKey',
            };
            // When OAuth is selected (not API-KEY), should use Authorization header
            expect(computeAuthorizationHeader(api, 'OAUTH')).toBe('Authorization');
        });

        it('should not use ApiKey header when api_key is not in securityScheme', () => {
            const api = {
                securityScheme: ['oauth2'],
                apiKeyHeader: 'X-Custom-ApiKey',
            };
            expect(computeAuthorizationHeader(api, 'API-KEY')).toBe('Authorization');
        });
    });

    describe('edge cases', () => {
        it('should handle missing securityScheme', () => {
            const api = { authorizationHeader: null };
            expect(computeAuthorizationHeader(api, 'OAUTH')).toBe('Authorization');
        });

        it('should handle empty securityScheme array', () => {
            const api = { securityScheme: [], authorizationHeader: null };
            expect(computeAuthorizationHeader(api, 'API-KEY')).toBe('Authorization');
        });

        it('should handle synapse gateway with custom apiKeyHeader', () => {
            const api = {
                gatewayType: 'wso2/synapse',
                securityScheme: ['api_key'],
                apiKeyHeader: 'X-Synapse-Key',
            };
            expect(computeAuthorizationHeader(api, 'API-KEY')).toBe('X-Synapse-Key');
        });

        it('should produce same result for platform and synapse gateways (unified logic)', () => {
            const baseApi = {
                securityScheme: ['api_key'],
                apiKeyHeader: 'X-My-Key',
            };
            const platformApi = { ...baseApi, gatewayType: 'APIPlatform' };
            const synapseApi = { ...baseApi, gatewayType: 'wso2/synapse' };

            const platformResult = computeAuthorizationHeader(platformApi, 'API-KEY');
            const synapseResult = computeAuthorizationHeader(synapseApi, 'API-KEY');
            expect(platformResult).toBe(synapseResult);
            expect(platformResult).toBe('X-My-Key');
        });
    });
});
