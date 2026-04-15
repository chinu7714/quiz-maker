export function exactOrContains(userInput: string, answer: string) {
  const user = userInput.trim().toLowerCase();
  const correct = answer.trim().toLowerCase();
  return user === correct || user.includes(correct) || correct.includes(user);
}
