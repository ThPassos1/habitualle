const failures: Record<string, string> = {
  cc_rejected_insufficient_amount: "O banco recusou por limite ou saldo. Tente outro cartão ou Pix.",
  cc_rejected_bad_filled_card_number: "Confira o número do cartão.",
  cc_rejected_bad_filled_date: "Confira a validade do cartão.",
  cc_rejected_bad_filled_security_code: "Confira o código de segurança.",
  cc_rejected_bad_filled_other: "Confira os dados do cartão.",
  cc_rejected_call_for_authorize: "O banco pediu autorização. Ligue para o banco ou escolha Pix.",
  cc_rejected_card_disabled: "Este cartão está desabilitado. Tente outro ou escolha Pix.",
  cc_rejected_duplicated_payment: "Esse pagamento já foi enviado. Aguarde um instante e consulte o pedido.",
  cc_rejected_high_risk: "O pagamento não foi aprovado. Tente Pix ou outro cartão.",
  cc_rejected_insufficient_data: "Faltou algum dado do cartão. Confira e tente de novo.",
  cc_rejected_invalid_installments: "Esse parcelamento não está disponível para o cartão.",
  cc_rejected_max_attempts: "Houve várias tentativas. Espere um pouco ou escolha Pix.",
  cc_rejected_other_reason: "O pagamento não foi aprovado. Tente Pix ou outro cartão.",
  rejected_by_bank: "O banco não autorizou. Tente outro cartão ou Pix.",
  rejected_insufficient_data: "Faltou algum dado para aprovar o pagamento.",
};

export function paymentFailureMessage(detail: string | null | undefined) {
  if (detail && failures[detail]) return failures[detail];
  return "O pagamento não foi aprovado. Tente Pix ou outro cartão.";
}

export function paymentStatusLabel(status: string | null | undefined) {
  switch (status) {
    case "approved":
      return "Aprovado";
    case "authorized":
      return "Autorizado";
    case "pending":
      return "Aguardando";
    case "in_process":
      return "Em análise";
    case "rejected":
      return "Recusado";
    case "cancelled":
      return "Cancelado";
    case "refunded":
      return "Estornado";
    case "charged_back":
      return "Contestação";
    default:
      return status?.trim() || "";
  }
}
