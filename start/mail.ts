import Mail from "@ioc:Adonis/Addons/Mail";

Mail.monitorQueue(async (error) => {
  if (error) {
    // console.log("Unable to send email subject => ", message.subject);
    // console.log(error.mail);

    return;
  }

  // TODO encontrar a ordem de serviço e salvar o processamento

  // console.log("Email sent subject => ", message.subject);
  // console.log(result?.mail);
  // console.log(result?.response);
});
