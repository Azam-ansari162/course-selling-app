async function loadPurchasedCourses(){
    const token=localStorage.getItem("userToken")
    const container=document.querySelector(".purchased-courses")
    if(!token){
        alert("Please log in to view your purchases.")
        window.location.href="loginPage.html?role=user"
        return;
    }
    try{
        const response=await fetch("http://localhost:3000/users/purchases",{
            method:"GET",
            headers:{
                token:token
            }
        })
        const data=await response.json()
        if(!response.ok){
            alert(data.msg || "Failed to load purchases")
            return
        }
        if(!data.courseData || data.courseData.length==0){
            container.innerHTML="<p>you haven't purchased any courses yet.</p>"
            return
        }
        let html=""
        data.courseData.forEach((course)=>{
            html+=`<div class="course"><h3>${course.course}</h3>
         <p>${course.description}</p>
         <span>₹${course.price}</span>
         <button disabled style="margin-top: 10px;">Enrolled</button></div>`

        })
        container.innerHTML=html
    }
    catch(err){
        console.error("Purchases fethc error: ",err)
        container.innerHTML="<p>Error loading your purchases</p>"
    }
    

}
loadPurchasedCourses()
