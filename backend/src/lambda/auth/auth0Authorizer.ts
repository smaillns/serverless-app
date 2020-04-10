import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')
const cert = `-----BEGIN CERTIFICATE-----
MIIC/zCCAeegAwIBAgIJFJ7X2xFYFiGzMA0GCSqGSIb3DQEBCwUAMB0xGzAZBgNV
BAMTEnNtYWlsbG5zLmF1dGgwLmNvbTAeFw0yMDA0MDkwODI1NThaFw0zMzEyMTcw
ODI1NThaMB0xGzAZBgNVBAMTEnNtYWlsbG5zLmF1dGgwLmNvbTCCASIwDQYJKoZI
hvcNAQEBBQADggEPADCCAQoCggEBALMZac9TW975gWOfRFcqoLWHjsDD0+zf7unv
erTEx5htbM3HOeVBr+q/J2omrz1acwipCiSQ7y0STaYNNHseA8zQi+7KbgLiDA6T
DWriQZQeBW8056gIO2j7Tp4q9JYerhNj9j8PPEWtrVTVaOIuiTNCDKlxfGqGK2rw
BjTTerNOPZB2JLIKdUtJ9dRZGXnRm8JGw1D3KjQH3cprHhwndofJDK4f2Denqjp7
aBkbDcI2LylT2u7pPGZ0DOlnLfNi0ja/1zMadYUUOL2Bt92m21F2/gw8akAMtjW6
izPMiJWr/pBJhE1n9TXvFQbl4xBuyauNvJ8cb0vK1+uea1ZYWG8CAwEAAaNCMEAw
DwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQU8mOR46Z3MoWIx3GQyGrZYVVRdEcw
DgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQB1Lc/5bvo4iFEm8zgZ
SfTJ7eZbzA7fivmNV7F2F3Q8/2XIAJqBKfLOkHtWL+KogLHC3nRhVNlaojHnJ6ZL
wZRXa6qimmTOTh6+K/XVmBBfBXydSgI4z1CSl3veQsPQOeVMxZs822pTuGqEKBCa
lO3UjXwqQdvjGAswNF88cbRtlCEZEH26xEuCxlD4NFneJ0jTWgFMLo7WasfZe8RQ
UmPWUyFmbsOvrzAmUeCjHE1jSEWrHNj7soezqQza+Og431O/ppBziqSu3W80zTx8
ORRn7oTBvpXzD72Xa+8+9mmPMLDYu1vQF4asJg/6xsjirJHqBxHI3R9LbxbTPosB
yG3L
-----END CERTIFICATE-----`


export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
