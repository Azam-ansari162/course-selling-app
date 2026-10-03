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
renderAvailableCourses()
