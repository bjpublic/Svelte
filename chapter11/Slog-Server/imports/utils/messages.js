export const successMessage = (message) => {
  return {
    statusCode: 200,
    body: {status: 'success', message: `${message}`}    
  }
}

export const failMessage = (message) => {
  return {
    statusCode: 400,
    body: {status: 'fail', message: `${message}`}        
  }
}