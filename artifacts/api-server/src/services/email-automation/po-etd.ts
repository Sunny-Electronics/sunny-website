export interface PoEtdDecisionInput {
  customerRequestedDate?: string;
  sunnyConfirmedEtd: string;
}

export interface PoEtdDecision {
  confirmedDate: string;
  customerRequestedDate?: string;
  reviewRequired: boolean;
  customerMessageNote?: string;
}

export function decidePoEtdConfirmation(
  input: PoEtdDecisionInput,
): PoEtdDecision {
  if (!input.customerRequestedDate) {
    return {
      confirmedDate: input.sunnyConfirmedEtd,
      reviewRequired: false,
    };
  }

  const customerRequestedTime = Date.parse(input.customerRequestedDate);
  const sunnyConfirmedTime = Date.parse(input.sunnyConfirmedEtd);

  if (Number.isNaN(customerRequestedTime) || Number.isNaN(sunnyConfirmedTime)) {
    return {
      confirmedDate: input.sunnyConfirmedEtd,
      customerRequestedDate: input.customerRequestedDate,
      reviewRequired: true,
      customerMessageNote: "Please review confirmed ETD.",
    };
  }

  if (customerRequestedTime < sunnyConfirmedTime) {
    return {
      confirmedDate: input.sunnyConfirmedEtd,
      customerRequestedDate: input.customerRequestedDate,
      reviewRequired: true,
      customerMessageNote: "Please review confirmed ETD.",
    };
  }

  return {
    confirmedDate: input.customerRequestedDate,
    customerRequestedDate: input.customerRequestedDate,
    reviewRequired: false,
  };
}

