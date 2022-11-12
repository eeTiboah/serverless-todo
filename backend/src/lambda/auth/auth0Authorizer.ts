import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios, { AxiosResponse } from 'axios'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const jwksUrl = 'https://dev-snxunexs.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing token', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User authorized', jwtToken)

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
    logger.error('User authorization failed', { error: e.message })

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
  const certificate = await auth0Certificate(jwksUrl)
  return verify(token, certificate, { algorithms: ['RS256'] }) as JwtPayload
}

async function auth0Certificate(jwkUrl: string): Promise<string> {
  try {
    const jwk: AxiosResponse = await Axios.get(jwkUrl)
    const downloadedCert = jwk.data.keys[0]['x5c'][0]
    const cert =
      '-----BEGIN CERTIFICATE-----' +
      '\n' +
      downloadedCert +
      '\n' +
      '-----END CERTIFICATE-----'
    logger.info(cert)
    return cert
  } catch (err) {
    return 'Invalid certificate'
  }
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')
  const split = authHeader.split(' ')
  const token = split[1]
  return token
}


