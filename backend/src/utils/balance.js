const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value._id) return value._id.toString();
  return value.toString();
};

const buildShareMap = (expense) => {
  const amount = Number(expense.amount || 0);
  const participants = (expense.participants || []).map((p) => getId(p));
  const splits = expense.splits || [];
  const splitType = expense.splitType || "equal";
  const shares = new Map();

  if (participants.length === 0) return shares;

  if (splitType === "equal") {
    const share = amount / participants.length;
    participants.forEach((id) => shares.set(id, share));
    return shares;
  }

  if (splitType === "unequal") {
    splits.forEach((split) => {
      shares.set(getId(split.user), Number(split.amountOwed || 0));
    });
    participants.forEach((id) => {
      if (!shares.has(id)) shares.set(id, 0);
    });
    return shares;
  }

  if (splitType === "percentage") {
    splits.forEach((split) => {
      const percent = Number(split.percentage || 0);
      shares.set(getId(split.user), (amount * percent) / 100);
    });
    participants.forEach((id) => {
      if (!shares.has(id)) shares.set(id, 0);
    });
    return shares;
  }

  const totalShares = splits.reduce(
    (sum, split) => sum + Number(split.shares || 0),
    0,
  );
  if (totalShares <= 0) {
    const share = amount / participants.length;
    participants.forEach((id) => shares.set(id, share));
    return shares;
  }

  splits.forEach((split) => {
    const units = Number(split.shares || 0);
    shares.set(getId(split.user), (amount * units) / totalShares);
  });
  participants.forEach((id) => {
    if (!shares.has(id)) shares.set(id, 0);
  });
  return shares;
};

const computeBalances = ({ userId, expenses, settlements }) => {
  const balanceMap = new Map();

  const addBalance = (friendId, amount) => {
    if (!friendId || friendId === userId) return;
    const current = balanceMap.get(friendId) || 0;
    balanceMap.set(friendId, current + amount);
  };

  (expenses || []).forEach((expense) => {
    const paidById = getId(expense.paidBy);
    const shareMap = buildShareMap(expense);

    if (paidById === userId) {
      shareMap.forEach((share, participantId) => {
        if (participantId !== userId) {
          addBalance(participantId, share);
        }
      });
      return;
    }

    if (shareMap.has(userId)) {
      const share = shareMap.get(userId) || 0;
      addBalance(paidById, -share);
    }
  });

  (settlements || []).forEach((settlement) => {
    const fromId = getId(settlement.from);
    const toId = getId(settlement.to);
    const amount = Number(settlement.amount || 0);
    if (fromId === userId) {
      addBalance(toId, amount);
    } else if (toId === userId) {
      addBalance(fromId, -amount);
    }
  });

  return balanceMap;
};

module.exports = { computeBalances };
