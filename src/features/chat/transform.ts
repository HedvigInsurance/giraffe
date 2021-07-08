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
  TextContentType
} from '../../generated/graphql'
import {MessageDto} from '../../api'

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
  const getBody: (bodyInput: MessageBody ) => MessageBody = (bodyInput ) => {
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
      return transformTextOrNumberBody<MessageBodyText>(bodyInput as MessageBodyText)
    }

    if (bodyInput.type === 'number') {
      return transformTextOrNumberBody<MessageBodyNumber>(bodyInput as MessageBodyNumber)
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

const transformTextOrNumberBody = <T extends MessageBodyText | MessageBodyNumber >(
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
      return TextContentType.None
    }
    case 'URL': {
      return TextContentType.Url
    }
    case 'addressCity': {
      return TextContentType.AddressCity
    }
    case 'addressCityAndState': {
      return TextContentType.AddressCityState
    }
    case 'addressState': {
      return TextContentType.AddressState
    }
    case 'countryName': {
      return TextContentType.CountryName
    }
    case 'creditCardNumber': {
      return TextContentType.CreditCardNumber
    }
    case 'emailAddress': {
      return TextContentType.EmailAddress
    }
    case 'familyName': {
      return TextContentType.FamilyName
    }
    case 'fullStreetAddress': {
      return TextContentType.FullStreetAddress
    }
    case 'givenName': {
      return TextContentType.GivenName
    }
    case 'jobTitle': {
      return TextContentType.JobTitle
    }
    case 'location': {
      return TextContentType.Location
    }
    case 'middleName': {
      return TextContentType.MiddleName
    }
    case 'name': {
      return TextContentType.Name
    }
    case 'namePrefix': {
      return TextContentType.NamePrefix
    }
    case 'nameSuffix': {
      return TextContentType.NameSuffix
    }
    case 'nickname': {
      return TextContentType.NickName
    }
    case 'organizationName': {
      return TextContentType.OrganizationName
    }
    case 'postalCode': {
      return TextContentType.PostalCode
    }
    case 'streetAddressLine1': {
      return TextContentType.StreetAddressLine1
    }
    case 'streetAddressLine2': {
      return TextContentType.StreetAddressLine2
    }
    case 'sublocality': {
      return TextContentType.Sublocality
    }
    case 'telephoneNumber': {
      return TextContentType.TelephoneNumber
    }
    case 'username': {
      return TextContentType.Username
    }
    case 'password': {
      return TextContentType.Password
    }
    default:
      throw Error(`unknown keyboard type: ${unmapped}`)
  }
}

const mapKeyboard = (unmapped: string): KeyboardType => {
  switch (unmapped) {
    case 'default': {
      return KeyboardType.Default
    }
    case 'number-pad': {
      return KeyboardType.Numberpad
    }
    case 'decimal-pad': {
      return KeyboardType.Decimalpad
    }
    case 'numeric': {
      return KeyboardType.Numeric
    }
    case 'email-address': {
      return KeyboardType.Email
    }
    case 'phone-pad': {
      return KeyboardType.Phone
    }
    default:
      throw Error(`unknown keyboard type: ${unmapped}`)
  }
}

export const transformMessages: (messages: MessageDto[]) => Message[] = (
  messages: MessageDto[],
) => messages.map(transformMessage).filter((message) => !!message) as Message[]
