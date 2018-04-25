export default function() {
  return {
    reset: false,
    suspend: false,
    pause: false,
    freeze: false,
    range: [
      Date.now() - 300 * 1000,
      Date.now()
    ],
  }
}
