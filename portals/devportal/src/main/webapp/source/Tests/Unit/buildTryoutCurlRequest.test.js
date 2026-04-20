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

import { requestObjectToCurl } from 'AppComponents/Apis/Details/ApiConsole/buildTryoutCurlRequest';

describe('requestObjectToCurl', () => {
    describe('basic request generation', () => {
        it('should generate a GET curl with url', () => {
            const curl = requestObjectToCurl({
                method: 'GET',
                url: 'https://localhost:8243/api/v1/resource',
            });
            expect(curl).toContain("curl -X 'GET'");
            expect(curl).toContain('https://localhost:8243/api/v1/resource');
        });

        it('should generate a POST curl', () => {
            const curl = requestObjectToCurl({
                method: 'POST',
                url: 'https://localhost:8243/api/v1/resource',
            });
            expect(curl).toContain("curl -X 'POST'");
        });

        it('should default method to GET when not specified', () => {
            const curl = requestObjectToCurl({ url: 'https://example.com' });
            expect(curl).toContain("curl -X 'GET'");
        });

        it('should uppercase the method', () => {
            const curl = requestObjectToCurl({ method: 'delete', url: 'https://example.com' });
            expect(curl).toContain("curl -X 'DELETE'");
        });

        it('should handle empty url', () => {
            const curl = requestObjectToCurl({ method: 'GET' });
            expect(curl).toContain("curl -X 'GET'");
        });
    });

    describe('header handling', () => {
        it('should include headers in curl output', () => {
            const curl = requestObjectToCurl({
                method: 'GET',
                url: 'https://example.com',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });
            expect(curl).toContain("'Content-Type: application/json'");
            expect(curl).toContain("'Accept: application/json'");
        });

        it('should skip headers with null values', () => {
            const curl = requestObjectToCurl({
                method: 'GET',
                url: 'https://example.com',
                headers: { Authorization: null },
            });
            expect(curl).not.toContain('Authorization');
        });

        it('should skip headers with undefined values', () => {
            const curl = requestObjectToCurl({
                method: 'GET',
                url: 'https://example.com',
                headers: { Authorization: undefined },
            });
            expect(curl).not.toContain('Authorization');
        });

        it('should skip headers with empty string values', () => {
            const curl = requestObjectToCurl({
                method: 'GET',
                url: 'https://example.com',
                headers: { Authorization: '' },
            });
            expect(curl).not.toContain('Authorization');
        });

        it('should handle missing headers object', () => {
            const curl = requestObjectToCurl({
                method: 'GET',
                url: 'https://example.com',
            });
            expect(curl).toContain("curl -X 'GET'");
            expect(curl).not.toContain('-H');
        });
    });

    describe('OAuth/Basic credential passthrough (Issue #4962 fix)', () => {
        it('should preserve actual Bearer token in Authorization header', () => {
            const curl = requestObjectToCurl({
                method: 'GET',
                url: 'https://platform.localhost:8243/api/v1/get',
                headers: {
                    Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.actual-token',
                },
            });
            expect(curl).toContain('Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.actual-token');
            expect(curl).not.toContain('<ACCESS_TOKEN>');
        });

        it('should preserve actual Basic credentials in Authorization header', () => {
            const curl = requestObjectToCurl({
                method: 'GET',
                url: 'https://platform.localhost:8243/api/v1/get',
                headers: {
                    Authorization: 'Basic YWRtaW46YWRtaW4=',
                },
            });
            expect(curl).toContain('Basic YWRtaW46YWRtaW4=');
            expect(curl).not.toContain('<BASE64_CREDENTIALS>');
        });

        it('should preserve API Key header with actual value', () => {
            const curl = requestObjectToCurl({
                method: 'GET',
                url: 'https://platform.localhost:8243/api/v1/get',
                headers: {
                    ApiKey: 'my-actual-api-key-value',
                },
            });
            expect(curl).toContain("'ApiKey: my-actual-api-key-value'");
        });

        it('should preserve custom API Key header name with actual value', () => {
            const curl = requestObjectToCurl({
                method: 'GET',
                url: 'https://platform.localhost:8243/api/v1/get',
                headers: {
                    'X-Custom-ApiKey': 'custom-key-123',
                },
            });
            expect(curl).toContain("'X-Custom-ApiKey: custom-key-123'");
        });
    });

    describe('body handling', () => {
        it('should include string body with -d flag', () => {
            const curl = requestObjectToCurl({
                method: 'POST',
                url: 'https://example.com',
                body: '{"name":"test"}',
            });
            expect(curl).toContain("-d '{\"name\":\"test\"}'");
        });

        it('should JSON-stringify object body', () => {
            const curl = requestObjectToCurl({
                method: 'POST',
                url: 'https://example.com',
                body: { name: 'test' },
            });
            expect(curl).toContain("-d '{\"name\":\"test\"}'");
        });

        it('should skip body when undefined', () => {
            const curl = requestObjectToCurl({
                method: 'POST',
                url: 'https://example.com',
                body: undefined,
            });
            expect(curl).not.toContain('-d');
        });

        it('should skip body when null', () => {
            const curl = requestObjectToCurl({
                method: 'POST',
                url: 'https://example.com',
                body: null,
            });
            expect(curl).not.toContain('-d');
        });

        it('should skip body when empty string', () => {
            const curl = requestObjectToCurl({
                method: 'POST',
                url: 'https://example.com',
                body: '',
            });
            expect(curl).not.toContain('-d');
        });

        it('should add comment for FormData body', () => {
            const formData = new FormData();
            const curl = requestObjectToCurl({
                method: 'POST',
                url: 'https://example.com',
                body: formData,
            });
            expect(curl).toContain('# multipart/form-data');
        });
    });

    describe('shell escaping', () => {
        it('should escape single quotes in URL', () => {
            const curl = requestObjectToCurl({
                method: 'GET',
                url: "https://example.com/api?q=it's",
            });
            expect(curl).toContain("'https://example.com/api?q=it'\\''s'");
        });

        it('should escape single quotes in header values', () => {
            const curl = requestObjectToCurl({
                method: 'GET',
                url: 'https://example.com',
                headers: { 'X-Custom': "value'with'quotes" },
            });
            expect(curl).toContain("'X-Custom: value'\\''with'\\''quotes'");
        });

        it('should escape single quotes in body', () => {
            const curl = requestObjectToCurl({
                method: 'POST',
                url: 'https://example.com',
                body: "it's a test",
            });
            expect(curl).toContain("-d 'it'\\''s a test'");
        });
    });

    describe('output formatting', () => {
        it('should join lines with backslash-newline continuation', () => {
            const curl = requestObjectToCurl({
                method: 'GET',
                url: 'https://example.com',
                headers: { Accept: 'application/json' },
            });
            expect(curl).toContain(' \\\n');
        });
    });
});
