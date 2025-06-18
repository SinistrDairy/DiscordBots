import { CommandControlPlugin, controller } from "@sern/handler";
const ownerIDs = ["697795666373640213"];
//! Fill your ID
function ownerOnly(override) {
  return CommandControlPlugin((ctx) => {
    if ((override ?? ownerIDs).includes(ctx.user.id))
      return controller.next();
    return controller.stop();
    //! Important: It stops the execution of command!
  });
}
export {
  ownerOnly
};
