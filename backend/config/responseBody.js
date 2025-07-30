function responseBody(status, message, data = null) {
  return {
    status,
    message,
    body: data
  };
}

module.exports = { responseBody };