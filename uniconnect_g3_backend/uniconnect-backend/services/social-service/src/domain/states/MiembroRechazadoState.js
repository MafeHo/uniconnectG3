const IMembershipState = require('./IMembershipState');

class MiembroRechazadoState extends IMembershipState {
  constructor(subject) {
    super(subject);
  }
}

module.exports = MiembroRechazadoState;
