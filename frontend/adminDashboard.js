const adminToken=localStorage.getItem("adminToken")
if(!adminToken){
    alert("Unauthorised! please sign inas an admin.")
    window.location.href="loginPage.html?role=admin"
}

document.getElementById("createBtn").addEventListener("click",async()=>{
    const course=document.getElementById("createTitle").ariaValueMax.trim()
    const description=document.getElementById("createDesc").ariaValueMax.trim()
    const price=Number(document.getElementById("createPrice").value)

    if(!course || !description || isNaN(price)){
        alert("please enter title, description, and price")
        return
    }

    try{
        const response=await fetch("http:/localhost:3000/course/create",{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "token":adminToken
            },
            body:JSON.stringify({course:course,description:description,price:price})
        })

        const data=await response.json()
        if(response.ok){
            alert(data.msg || "Course created successfully!")
            document.getElementById("createTitle").value=""
            document.getElementById("createDesc").value=""
            document.getElementById("creatPrice").value=""
        }
        else{
            alert(data.msg || "Failed tpo create course.")
        }
    }
    catch(err){
        console.error("Create course error:",err)
        alert("Server connection error during course creation.")

    }
})
document.getElementById("updateBtn").addEventListener("click",async ()=>{
    const courseId=document.getElementById("updateBtn").value.trim()
    const course=document.getElementById("updateTitle").value.trim()
    const description=document.getElementById("updateDesc").value.trim()
    const priceInput=document.getElementById("updatePrice").value
    const price=priceInput?Number(priceInput):undefined
    if(!courseId){
        alert("Please enter the course ID to update.")
        return
    }
    try{
        const res=await fetch("http://localhost:3000/course/update",{
            method:"PUT",
            headers:{
                "Content-Type":"application/json",
                "token":adminToken
            },
            body:JSON.stringify({
                courseId:courseId,
                course:course,
                description:description,
                price:price
            })
        })

        const data=await res.json()
        if(res.ok){
            alert(data.msg || "Course updated successfully!")
            document.getElementById("update").value=""
            document.getElementById("updateTitle").value=""
            document.getElementById("updateDesc").value=""
            document.getElementById("updatePrice").value=""
        }
        else{
            alert(data.msg || "failed to update course.")
        }
    }
    catch(err){
        console.error("Update course error:",err)
        alert("Server connection error during course update.")

    }
})

document.getElementById("deletebtn").addEventListener("click",async ()=>{
    const course=document.getElementById("deleteId").value.trim()

    if(!course){
        alert("Please enter the course name to be deleted.")
        return
    }
    if(!confirm(`Are you sure you want to delete the course "${course}"`)){
        return;
    }
    try{
        const response=await fetch("http://localhost:3000/course/delete",{
            method:"DELETE",
            headers:{
                "Content-Type":"application/json",
                "token":adminToken
            },
            body:JSON.stringify({
                course:course
            })
        })

        const data=await response.json()
        if(response.ok){
            alert(data.msg || "Course deleted successfully!")
            document.getElementById("deleteId").value=""
        }else{
            alert(data.msg || "Failed to delete course.")
        }
    }
    catch(err){
        console.error("Delete course error",err)
        alert("Server connection error during course deletion.")
    }
})

document.getElementById("logoutBtn").addEventListener("click",()=>{
    localStorage.removeItem("adminToken")
    window.location.href="loginPage.html?role=admin"
})