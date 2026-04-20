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

import isPlatformGatewayApi from 'AppComponents/Apis/Details/ApiConsole/platformGateway';

describe('isPlatformGatewayApi', () => {
    it('should return true for APIPlatform gatewayType', () => {
        expect(isPlatformGatewayApi({ gatewayType: 'APIPlatform' })).toBe(true);
    });

    it('should return false for wso2/synapse gatewayType', () => {
        expect(isPlatformGatewayApi({ gatewayType: 'wso2/synapse' })).toBe(false);
    });

    it('should return false for empty string gatewayType', () => {
        expect(isPlatformGatewayApi({ gatewayType: '' })).toBe(false);
    });

    it('should return false when gatewayType is undefined', () => {
        expect(isPlatformGatewayApi({})).toBe(false);
    });

    it('should return false for null api', () => {
        expect(isPlatformGatewayApi(null)).toBe(false);
    });

    it('should return false for undefined api', () => {
        expect(isPlatformGatewayApi(undefined)).toBe(false);
    });

    it('should be case-sensitive (apiplatform lowercase should return false)', () => {
        expect(isPlatformGatewayApi({ gatewayType: 'apiplatform' })).toBe(false);
        expect(isPlatformGatewayApi({ gatewayType: 'APIPLATFORM' })).toBe(false);
    });
});
