export default function() {
  return {
    reset: false,
    range: [
      Date.now() - 300 * 1000,
      Date.now()
    ],
  }
}
