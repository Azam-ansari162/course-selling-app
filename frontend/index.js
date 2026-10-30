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
            return
        }
        const courseName=btn.getAttribute("data-course")
        btn.disabled=true
        btn.innerText="Purchasing..."
        try{
            const response=await fetch(`http://localhost:3000/users/purchase`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "token":token
                },
                body:JSON.stringify({
                    course:courseName
                })
            })
            const data=await response.json()
            if(response.ok){
                alert(data.msg || "Successfully Purchased the Course")
                btn.innerText="Puchased"

            }
            else{
                alert(data.msg || "Purchased failed.")
                btn.disabled=false;
                btn.innerText="Buy"
            }
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
