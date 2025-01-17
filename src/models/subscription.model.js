import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    channel: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ]
}, {timestamps: true});

const Subscription = mongoose.model("Subscription", subscriptionSchema);
// 20:09 L20) Recall that, the name "Subscription" gets converted into lower+plural. Means, it will be stored as "subscriptions" in our database!
// Just like, "User" is be stored as "users"!
// Yes, its default behaviour, until you specify the name like this "mongoose.model("Subscription", subscriptionSchema, "Subscription")" -> In such a case, it will be saved as "Subscription"!
export default Subscription;
