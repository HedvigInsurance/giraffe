import { TextContentType } from './../../typings/generated-graphql-types';
import { MessageDto } from '../../api'

import {
  KeyboardType,
  Message,
  MessageBody,
  MessageBodyAudio,
  MessageBodyBankIdCollect,
  MessageBodyFile,
  MessageBodyMultipleSelect,
  MessageBodyNumber,
  MessageBodyParagraph,
  MessageBodySingleSelect,
  MessageBodyText,
  MessageBodyUndefined,
} from '../../typings/generated-graphql-types'

const transformChoices = (choices: any) => {
  if (!choices) {
    return choices
  }

  return choices.map((choice: any) => {
    if (choice.view) {
      return {
        ...choice,
        view: choice.view.toUpperCase(),
      }
    }

    return choice
  })
}

export const transformMessage: (message: MessageDto) => Message = (message) => {
  const getBody: (bodyInput: MessageBody) => MessageBody = (bodyInput) => {
    if (bodyInput.type === 'single_select') {
      const body = bodyInput as MessageBodySingleSelect
      body.choices = transformChoices(body.choices)
      return body
    }

    if (bodyInput.type === 'multiple_select') {
      const body = bodyInput as MessageBodyMultipleSelect
      body.choices = transformChoices(body.choices)
      return body
    }

    if (bodyInput.type === 'text') {
      return transformTextOrNumberBody<MessageBodyText>(bodyInput)
    }

    if (bodyInput.type === 'number') {
      return transformTextOrNumberBody<MessageBodyNumber>(bodyInput)
    }

    if (bodyInput.type === 'audio') {
      return bodyInput as MessageBodyAudio
    }

    if (bodyInput.type === 'bankid_collect') {
      return bodyInput as MessageBodyBankIdCollect
    }

    if (bodyInput.type === 'file_upload') {
      return bodyInput as MessageBodyFile
    }

    if (bodyInput.type === 'paragraph') {
      return bodyInput as MessageBodyParagraph
    }

    return bodyInput as MessageBodyUndefined
  }

  const messageBody = getBody(message.body as MessageBody)

  return {
    id: message.id,
    globalId: message.globalId,
    header: {
      fromMyself: message.header.fromId !== 1,
      messageId: message.header.messageId,
      timeStamp: message.header.timeStamp,
      richTextChatCompatible: message.header.richTextChatCompatible || false,
      editAllowed: message.header.editAllowed,
      shouldRequestPushNotifications:
        message.header.shouldRequestPushNotifications || false,
      pollingInterval: message.header.pollingInterval || 0,
      loadingIndicator: message.header.loadingIndicator,
      markedAsRead: message.header.markedAsRead,
      statusMessage: message.header.statusMessage,
    },
    body: messageBody,
  }
}

const transformTextOrNumberBody = <
  T extends MessageBodyText | MessageBodyNumber
  >(
    body: T & { keyboardType?: string, textContentType?: string },
): T => {
  const ret = Object.assign({}, body) // tslint:disable-line prefer-object-spread
  if (ret.keyboardType) {
    ret.keyboard = mapKeyboard(ret.keyboardType)
  }

  if (ret.textContentType) {
    ret.textContentType = mapTextContentType(ret.textContentType)
  }

  return ret
}

const mapTextContentType = (unmapped: string): TextContentType => {
  switch (unmapped) {
    case 'none': {
      return TextContentType.NONE
    }
    case 'URL': {
      return TextContentType.URL
    }
    case 'addressCity': {
      return TextContentType.ADDRESS_CITY
    }
    case 'addressCityAndState': {
      return TextContentType.ADDRESS_CITY_STATE
    }
    case 'addressState': {
      return TextContentType.ADDRESS_STATE
    }
    case 'countryName': {
      return TextContentType.COUNTRY_NAME
    }
    case 'creditCardNumber': {
      return TextContentType.CREDIT_CARD_NUMBER
    }
    case 'emailAddress': {
      return TextContentType.EMAIL_ADDRESS
    }
    case 'familyName': {
      return TextContentType.FAMILY_NAME
    }
    case 'fullStreetAddress': {
      return TextContentType.FULL_STREET_ADDRESS
    }
    case 'givenName': {
      return TextContentType.GIVEN_NAME
    }
    case 'jobTitle': {
      return TextContentType.JOB_TITLE
    }
    case 'location': {
      return TextContentType.LOCATION
    }
    case 'middleName': {
      return TextContentType.MIDDLE_NAME
    }
    case 'name': {
      return TextContentType.NAME
    }
    case 'namePrefix': {
      return TextContentType.NAME_PREFIX
    }
    case 'nameSuffix': {
      return TextContentType.NAME_SUFFIX
    }
    case 'nickname': {
      return TextContentType.NICK_NAME
    }
    case 'organizationName': {
      return TextContentType.ORGANIZATION_NAME
    }
    case 'postalCode': {
      return TextContentType.POSTAL_CODE
    }
    case 'streetAddressLine1': {
      return TextContentType.STREET_ADDRESS_LINE1
    }
    case 'streetAddressLine2': {
      return TextContentType.STREET_ADDRESS_LINE2
    }
    case 'sublocality': {
      return TextContentType.SUBLOCALITY
    }
    case 'telephoneNumber': {
      return TextContentType.TELEPHONE_NUMBER
    }
    case 'username': {
      return TextContentType.USERNAME
    }
    case 'password': {
      return TextContentType.PASSWORD
    }
    default:
      throw Error(`unknown keyboard type: ${unmapped}`)
  }
}

const mapKeyboard = (unmapped: string): KeyboardType => {
  switch (unmapped) {
    case 'default': {
      return KeyboardType.DEFAULT
    }
    case 'number-pad': {
      return KeyboardType.NUMBERPAD
    }
    case 'decimal-pad': {
      return KeyboardType.DECIMALPAD
    }
    case 'numeric': {
      return KeyboardType.NUMERIC
    }
    case 'email-address': {
      return KeyboardType.EMAIL
    }
    case 'phone-pad': {
      return KeyboardType.PHONE
    }
    default:
      throw Error(`unknown keyboard type: ${unmapped}`)
  }
}

export const transformMessages: (messages: MessageDto[]) => Message[] = (
  messages: MessageDto[],
) => messages.map(transformMessage).filter((message) => !!message) as Message[]
