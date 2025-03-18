import {
  Box, Button, Checkbox, Flex, Modal, ModalBody, ModalContent, ModalFooter, ModalOverlay, Text, useDisclosure, VStack
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { colors } from '@/theme/cssVariables'
import { getStorageItem, setStorageItem } from '@/utils/localStorage'

const DISCLAIMER_KEY = '_r_have_agreed_disclaimer_'

function DisclaimerModal() {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [userHaveAgree, setUserHaveAgree] = useState(false)

  const confirmDisclaimer = () => {
    setStorageItem(DISCLAIMER_KEY, 1)
    onClose()
  }

  useEffect(() => {
    const haveAgreedDisclaimer = getStorageItem(DISCLAIMER_KEY)
    if (!haveAgreedDisclaimer || haveAgreedDisclaimer !== '1') {
      onOpen()
    }
  }, [onOpen])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'md', md: 'xl' }}
      scrollBehavior="inside"
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent bg={colors.backgroundLight} border={`1px solid ${colors.buttonSolidText}`} p={{ base: 4, md: 8 }}>
        <Text fontSize="xl" fontWeight="medium" color={colors.text02} mb={5}>
          {t('disclaimer.title')}
        </Text>
        <ModalBody>
          <VStack spacing={6}>
            <Box
              flex="1"
              p="4"
              overflowY="auto"
              bg={colors.backgroundDark}
              rounded="md"
              maxH={{ base: '20rem', md: '28rem' }}
              color={colors.lightPurple}
            >
              <Text mb="3" fontSize="sm">
                {t('disclaimer.text1')}
              </Text>
              <Text mb="3" fontSize="sm">
                {t('disclaimer.text2')}
              </Text>
              <Text mb="3" fontSize="sm">
                {t('disclaimer.text3')}
              </Text>
              <Text mb="3" fontSize="sm">
                {t('disclaimer.text4')}
              </Text>
            </Box>
            <Flex width="full" justifyContent="flex-start" alignItems="flex-start">
              <Checkbox isChecked={userHaveAgree} onChange={(e) => setUserHaveAgree(e.target.checked)} alignItems="flex-start">
                <Text fontSize="sm" fontWeight="medium" color={colors.textPrimary} display="inline-flex">
                  {t('disclaimer.agree_terms')}
                </Text>
              </Checkbox>
            </Flex>
          </VStack>
        </ModalBody>
        <ModalFooter mt={4}>
          <Flex width="full" justifyContent="center">
            <Button width="full" onClick={confirmDisclaimer} isDisabled={!userHaveAgree}>
              {t('disclaimer.enter_gravex')}
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DisclaimerModal
