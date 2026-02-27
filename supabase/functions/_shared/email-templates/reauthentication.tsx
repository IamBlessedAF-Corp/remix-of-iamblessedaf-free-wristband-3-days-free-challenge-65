/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

const LOGO_URL = 'https://pgvrrndmiefghksdtena.supabase.co/storage/v1/object/public/email-assets/logo.png'

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu código de verificación — IamBlessedAF</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="IamBlessedAF" width="140" height="auto" style={logo} />
        <Heading style={h1}>Código de verificación</Heading>
        <Text style={text}>Usa este código para confirmar tu identidad:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          Este código expira pronto. Si no lo solicitaste, puedes ignorar este correo.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "Georgia, 'Times New Roman', serif" }
const container = { padding: '40px 25px', maxWidth: '520px', margin: '0 auto' }
const logo = { margin: '0 0 24px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#141414',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: '#737373',
  lineHeight: '1.7',
  margin: '0 0 25px',
}
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#141414',
  margin: '0 0 30px',
  letterSpacing: '4px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
