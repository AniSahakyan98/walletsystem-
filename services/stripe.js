const User = require('../models/usersSchema')
const Transaction = require('../models/transactionDetailsSchema')
const Ledger = require('../models/ledgerEntries')

//✅ JWT authentication
// ✅ Protected routes with middleware
// ✅ Wallet top-up via Stripe PaymentIntent
// ✅ Pending transaction creation
// ✅ Frontend Stripe confirmation flow
// ✅ Webhook processing
// ✅ Transaction status updates
// ✅ Balance updates after successful payment

//update based on notepad

const handleStripeEvent = async(event) => {

    if(event.type === "payment_intent.succeeded") {

        const paymentIntent = event.data.object
        const amount = paymentIntent.amount / 100
        const walletId = paymentIntent.metadata.userId
        const user = await User.findOne({ walletId })
        console.log(user)
        const transactionId = paymentIntent.id
        
        if (!user) {
            throw new Error("User not found for webhook");
        }


        const existing = await Transaction.findOne({transactionId});
        if (existing.status === "Completed") {
            throw new Error("Transaction is already completed")
        }; //if (transaction.status === "Completed") return;
        
        console.log(existing.to)
       
        if (existing) {
            
            await Transaction.findOneAndUpdate(
            { transactionId },
            { $set: { status : "Completed" } },
            { new:true }
            );

            await Ledger.create({
                transactionId,
                "provider" : existing.fromSystem,
                "type": "CREDIT",
                amount
            },
            {
                transactionId,
                "userId" : existing.to._id,  //haskanal bugy inchi a null grvum ledgeri mej- voric heto haskanal vonc anel vor balance ledger ov hashvarkvi
                "type": "DEBIT",
                amount
            }
            )

        } else {
            throw new Error("No existing pending transaction")
        }
         await User.updateOne(
            {walletId},
            {$inc: {balance: amount}}
        )
        

    }

    if(event.type === "payment_intent.payment_failed") {
        const paymentIntent = event.data.object
        const transactionId = paymentIntent.id

         await Transaction.findOneAndUpdate(
            { transactionId },
            { $set: { status : "FAILED" }},
            { new:true }
         );
    }
}
//think when failed type ?
module.exports = {
    handleStripeEvent
}

//ok I did top up to stripe, I created an endpoint to imitate the response received from stripe and I created stripe endpoint handler, which receives the event of paymentIntent succeded and created transaction in db
