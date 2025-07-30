// src/_test_/App.test.tsx
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom' // Import jest-dom matchers
import App from '../App'
import { describe, it, expect } from 'vitest'
import { Provider } from 'react-redux'
import { store } from '../redux/store' // Adjust path as needed

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    )
    
    // Basic smoke test
    expect(screen.getByTestId('app-container')).toBeInTheDocument()
  })
})