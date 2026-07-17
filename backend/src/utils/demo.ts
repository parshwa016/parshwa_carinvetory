// Correct TDD Demo implementation
export const calculateDiscount = (price: number, role: string): number => {
  if (role === 'ADMIN') {
    return price * 0.9; // 10% discount
  }
  return price; // 0% discount
};
