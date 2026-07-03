export interface InputProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search';
  /** Error message — renders red border + red helper text */
  error?: string;
  /** Helper text below the input */
  helper?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export interface TextareaProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  error?: string;
  helper?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export interface SwitchProps {
  id?: string;
  label?: string;
  /** Secondary description line */
  description?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}
