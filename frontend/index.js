async function renderAvailableCourses(){
    const response=await fetch("http://localhost:3000/users/see")
    const data=await response.json()
    
    let html=""
    data.courses.forEach(course=>{
        // adding data-id to identify which course to buy

         const courseId=course._id
         html+=`<div class="course"><h3>${course.course}</h3>
         <p>${course.description}</p>
         <span>₹${course.price}</span>
        
         <button class="buy-btn" data-id="${courseId}" data-course="${course.course}">Buy</button>
         </div>
         `

    })
    document.querySelector(".available-courses").innerHTML=html
    buyingCourses()
    


    
    
    
    
}

async function buyingCourses(){
    
    const buyBtn=document.querySelectorAll(".buy-btn")
    buyBtn.forEach((btn)=>{
        btn.addEventListener("click",async ()=>{
        const token=localStorage.getItem("userToken")
        if(!token){
            alert("Please log in to purchase this course")
            window.location.href = "loginPage.html?role=user";
            return
        }
        const courseId=btn.getAttribute("data-id")
        btn.disabled=true
        btn.innerText="Processing..."
        try{
            // 1. Create order on the backend
            const response=await fetch(`http://localhost:3000/users/create-order`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "token":token
                },
                body:JSON.stringify({
                    courseId:courseId
                })
            })
            const orderData=await response.json()
            if(!response.ok){
                alert("Failed to initialte payment")
                btn.disabled = false;
                btn.innerText = "Buy";
                return;
            }
            // 2. Configure and open Razorpay Checkout modal
            const options = {
                    key: orderData.keyId,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: "Course Platform",
                    description: orderData.courseName,
                    order_id: orderData.orderId,
                    // callback function
                    handler: async function (paymentResponse){
                        try{
                            btn.innerText="verifying..."
                            // 3. Send payment details to backend for signature verification
                            const verifyRes=await fetch("http://localhost:3000/users/verify-payment",{
                                method:"POST",
                                headers:{
                                    "Content-Type": "application/json",
                                    "token": token
                                },
                                body:JSON.stringify({
                                    razorpay_order_id: paymentResponse.razorpay_order_id,
                                    razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                    razorpay_signature: paymentResponse.razorpay_signature,
                                    courseId: courseId

                                })

                            })
                            const verifydata=await verifyRes.json()
                            if(verifydata.ok){
                                
                                alert(verifyData.msg || "Course purchased successfully!");
                                btn.innerText = "Purchased";
                                btn.disabled = true;
                            }
                            else {
                                alert(verifyData.msg || "Payment verification failed");
                                btn.disabled = false;
                                btn.innerText = "Buy";
                            }
                            
                        }
                        catch(err){
                            console.error("Verification error:", err);
                            alert("Payment verification error");
                            btn.disabled = false;
                            btn.innerText = "Buy";

                        }
                        

                    },
                    modal:{
                        ondismiss: function () {
                            btn.disabled = false;
                            btn.innerText = "Buy";
                        }
                    },
                    theme: {
                        color: "#3399cc"
                    }
                    

            }
            // don't need to memorize, just standard boilerplate
            // This is just the 3-step boilerplate required by Razorpay to launch the popup window:

            // 1. Create the Razorpay object with your options
            const rzp = new Razorpay(options);

            // 2. (Optional) Listen for payment failure (e.g. wrong OTP, card declined, insufficient balance)
            rzp.on("payment.failed", function (resp) {
                alert(resp.error.description || "Payment failed");
                btn.disabled = false;  // Re-enable the Buy button so user can try again
                btn.innerText = "Buy";
            });

            // 3. Actually display the popup on the screen
            rzp.open();
            
        }
        catch(err){
            console.error("Purchase error:",err)
            alert("Network error while processing purchase.")
            btn.disabled=false;
            btn.innerText="Buy"
        }

    })

    })

    
    

}

    // 1. Get the elements from the screen
    const chatToggleBtn = document.getElementById("chatToggleBtn");
    const chatCloseBtn = document.getElementById("chatCloseBtn");
    const chatWindow = document.getElementById("chatWindow");
    const chatForm = document.getElementById("chatForm");
    const chatInput = document.getElementById("chatInput");
    const chatMessages = document.getElementById("chatMessages");
    const sendBtn = document.querySelector("#chatForm button");

    // 2. Open the Chat Window
    chatToggleBtn.addEventListener("click", async () => {
        chatWindow.classList.remove("hidden");
    });

    // 3. Close the Chat Window
    chatCloseBtn.addEventListener("click", async () => {
        chatWindow.classList.add("hidden");
    });
    chatForm.addEventListener("submit",async(e)=>{
        e.preventDefault(); // stops the page from refreshing
        const userText=chatInput.value 
        if(userText=="") return
        // Show the user's message on the screen using innerHTML
        chatMessages.innerHTML+=`<div class="chat-bubble user-bubble">${userText}</div>`
        // Clear the input box
        chatInput.value=""
        // Disable button and change text to "Wait..." (just like your Buy button)
        sendBtn.disabled=true
        sendBtn.innerText="Wait..."

        try{
            const token=localStorage.getItem("userToken")
            // Send message to your Express backend
            const response=await fetch("http://localhost:3000/users/chat",{
                method:"POST",
                headers:{
                    "Content-Type": "application/json",
                    "token": token || ""
                },
                body:JSON.stringify({
                    message:userText
                })
            })

            const data=await response.json()
            if(response.ok){
                chatMessages.innerHTML+=`<div class="chat-bubble bot-bubble">${data.reply}</div>`

            }
            else{
                chatMessages.innerHTML+=`<div class="chat-bubble bot-bubble">Error: ${data.msg}</div>`
            }
        }
        catch(err){
            console.error("Chat error:", err);
            chatMessages.innerHTML += `<div class="chat-bubble bot-bubble">Server connection failed.</div>`;
        }
        // Turn the send button back on
        sendBtn.disabled = false;
        sendBtn.innerText = "Send";
        // Scroll to the bottom to see the newest message
        chatMessages.scrollTop = chatMessages.scrollHeight;

    })



renderAvailableCourses()
