import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ChakraProvider>
      {children}
    </ChakraProvider>
  )
} 