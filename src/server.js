import RazorPay from 'razorpay';

export const instance=new RazorPay({
    key_id:process.env.Pay_Key_id,
    key_secret:process.env.Pay_Key_secret
})