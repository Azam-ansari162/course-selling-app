
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
        
         <button class="buy-btn" data-id="${courseId}">Buy</button>
         </div>
         `

    })
    document.querySelector(".available-courses").innerHTML=html
    


    
    
    
    
}

renderAvailableCourses()
async function AuthForm(){

    const loginButton=document.querySelector(".submit")
    // automatically detect the role from the URL
    const urlParams=new URLSearchParams(window.location.search)
    const role=urlParams.get('role') || 'user' //defaults to user if missing
    loginButton.addEventListener("click",async ()=>{
        //remember for input fields always use .value  
        const email=document.querySelector(".username").value
        const password=document.querySelector(".password").value

        const endpoint=role==="admin"?"http://localhost:3000/admin/signin":"http://localhost:3000/users/signin"

        
        try{
            const response=await fetch(endpoint,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({email,password})
        })
        const data=await response.json()
        if(data && data.token){
            alert(`${role} Signed in successfully`)
            //saving the user token to use it for further requests 
            localStorage.setItem(role==="admin"?"adminToken":"userToken",data.token)
        }
        else{
            alert("Login failed. Please check your credentials")
        }

        }
        catch(err){
            console.error("Login error:",err)
            alert("Something went wrong connecting to the server")
        }
        

    })

    const signupButton=document.querySelector(".Signup")
    signupButton.addEventListener("click",async ()=>{
        const email=document.querySelector(".username").value
        const password=document.querySelector(".password").value 
        const endpoint=role==='admin'?"http://localhost:3000/admin/signup":"http://localhost:3000/users/signup"
        try{
            const response=await fetch(endpoint,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                email,
                password
            })
        })
        if(response.ok){
            const message=await response.json()
            alert(JSON.stringify(message))
        }
        else{
            alert(`Signup failed. Server status: ${response.status}`)
        }

        }
        catch(err){
            console.log("Error: ",err)
            alert("An error occurred during signup")
        }
    })
}
AuthForm()

