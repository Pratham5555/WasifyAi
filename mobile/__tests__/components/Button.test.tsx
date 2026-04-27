import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('react-native-linear-gradient', () => 'LinearGradient');

import Button from '../../src/components/Button';

describe('Button component', () => {
  it('renders title text', () => {
    const { getByText } = render(<Button title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Click Me" onPress={onPress} variant="outline" />);
    fireEvent.press(getByText('Click Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading=true', () => {
    const { queryByText, UNSAFE_getByType } = render(
      <Button title="Loading" onPress={() => {}} loading />
    );
    expect(queryByText('Loading')).toBeNull(); // text hidden during loading
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Disabled" onPress={onPress} variant="ghost" disabled />
    );
    fireEvent.press(getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
