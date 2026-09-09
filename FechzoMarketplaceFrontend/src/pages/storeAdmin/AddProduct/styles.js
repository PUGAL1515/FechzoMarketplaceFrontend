export const formStyles = `
  .label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
  }

  .input {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    padding: 11px 13px;
    outline: none;
    background: white;
    color: #111827;
    transition: all 0.2s ease;
  }

  .input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
  }

  .input:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }

  .input::placeholder {
    color: #9ca3af;
  }
`;
