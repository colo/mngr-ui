export default function() {
  return {
    reset: false,
    suspend: false,
    range: [
      Date.now() - 300 * 1000,
      Date.now()
    ],
  }
}
