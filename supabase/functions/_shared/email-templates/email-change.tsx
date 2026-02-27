/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

const LOGO_URL = 'https://pgvrrndmiefghksdtena.supabase.co/storage/v1/object/public/email-assets/logo.png'

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Confirma tu cambio de email — IamBlessedAF</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="IamBlessedAF" width="140" height="auto" style={logo} />
        <Heading style={h1}>Confirma tu nuevo email</Heading>
        <Text style={text}>
          Solicitaste cambiar tu email de{' '}
          <Link href={`mailto:${email}`} style={link}>{email}</Link>
          {' '}a{' '}
          <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>.
        </Text>
        <Text style={text}>
          Haz click abajo para confirmar el cambio:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirmar Cambio
        </Button>
        <Text style={footer}>
          Si no solicitaste este cambio, asegura tu cuenta de inmediato.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

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
const link = { color: 'inherit', textDecoration: 'underline' }
const button = {
  backgroundColor: '#ff0000',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
