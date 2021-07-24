import React from 'react'
import { TextInput, ResizingTextArea } from './'
import { render, screen, fireEvent } from 'test-utils'
import '@testing-library/jest-dom/extend-expect'

describe('TextInput', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <TextInput
        className="testing"
        value="My test input"
        onUserInput={() => null}
        placeholder="Test Placeholder"
        fontSize="12"
      />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('call the handler on user input', () => {
    const onUserInputSpy = jest.fn()
    render(
      <TextInput
        className="testing"
        value=""
        onUserInput={onUserInputSpy}
        placeholder="Test Placeholder"
        fontSize="12"
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Test Placeholder'), { target: { value: 'New value' } })

    expect(onUserInputSpy).toHaveBeenCalledWith('New value')
    expect(onUserInputSpy).toHaveBeenCalledTimes(1)
  })
})

describe('ResizableTextArea', () => {
  it('renders correctly', () => {
    const { asFragment } = render(
      <ResizingTextArea
        className="testing"
        value="My test input"
        onUserInput={() => null}
        placeholder="Test Placeholder"
        fontSize="12"
      />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('call the handler on user input', () => {
    const onUserInputSpy = jest.fn()
    render(
      <ResizingTextArea
        className="testing"
        value=""
        onUserInput={onUserInputSpy}
        placeholder="Test Placeholder"
        fontSize="12"
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Test Placeholder'), { target: { value: 'New value' } })

    expect(onUserInputSpy).toHaveBeenCalledWith('New value')
    expect(onUserInputSpy).toHaveBeenCalledTimes(1)
  })
})
