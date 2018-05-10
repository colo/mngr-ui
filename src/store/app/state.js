export default function() {
  return {
    paths: [],
    reset: false,
    suspend: false,
    pause: false,
    freeze: false,
    range: [
      Date.now() - 300 * 1000,
      null
    ],
  }
}
