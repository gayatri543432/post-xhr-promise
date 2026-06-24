const cl=console.log;
const postForm=document.getElementById('postForm')
const titleControl=document.getElementById('title')
const bodyControl=document.getElementById('body')
const userIdControl=document.getElementById('userId')
const addBtn=document.getElementById('addBtn')
const updateBtn=document.getElementById('updateBtn')
const postContainer=document.getElementById('postContainer')
const spinner=document.getElementById('spinner')

let postArr=[];

let BASE_URL='https://jsonplaceholder.typicode.com'
let POST_URL=`${BASE_URL}/posts`

function snackbar(msg,i){
    Swal.fire({
        title:msg,
        icon:i,
        timer:3000
    })
}
function makeApiCall(method,api_url,body=null){

    spinner.classList.remove('d-none')

    return new Promise((resolve,reject)=>{

        let xhr=new XMLHttpRequest();

        xhr.open(method,api_url)

        xhr.setRequestHeader('Content-Type','application/json')

        xhr.send(body?JSON.stringify(body) :null)

        xhr.onload=function(){

                if(xhr.status>=200 && xhr.status<=299){

                    let res=JSON.parse(xhr.response)

                    resolve(res)

                }else{

                    reject(xhr)

                }

                spinner.classList.add('d-none')
        }
        xhr.onerror=function(){

            reject(xhr)

            spinner.classList.add('d-none')
            
        }
    })
}

function createCards(arr){
    let res='';
    arr.forEach(p=>{
        res+= `<div class="col-md-3 mb-3" id="${p.id}">
                <div class="card h-100">
                    <div class="card-header"  data-toggle="tooltip" data-placement="top" title="${p.title}">
                        <h3>${p.title}</h3>
                    </div>
                    <div class="card-body">
                        <p>${p.body}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <i onclick="onEditbtn(this)" class="fa-solid fa-pen-to-square fa-2x text-primary"></i>
                        <i onclick="onDeletebtn(this)" class="fa-solid fa-trash-can fa-2x text-danger"></i>
                    </div>
                </div>
            </div>`
    })
    postContainer.innerHTML=res
}

function fetchPost(){
    makeApiCall('GET',POST_URL)
        .then(res=>{
            
            postArr=res
            createCards(postArr)

             $('[data-toggle="tooltip"]').tooltip()
        })
        .catch(err=>{
            snackbar(err,'error')
        })
}
fetchPost()

function onSubmitPost(ele){
    ele.preventDefault()
    let post_obj={
        title:titleControl.value,
        body:bodyControl.value,
        userId:userIdControl.value
    }

    makeApiCall('POST',POST_URL,post_obj)
        .then(res=>{
             createSingleCard(res)
        })
        .catch(err=>snackbar(err,'error'))

}

function createSingleCard(res){
    let card=document.createElement('div')
    card.className='col-md-3 mb-3'
    card.id=res.id
    card.innerHTML=` <div class="card h-100">
                    <div class="card-header"  data-toggle="tooltip" data-placement="top" title="${res.title}">
                        <h3>${res.title}</h3>
                    </div>
                    <div class="card-body">
                        <p>${res.body}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <i onclick="onEditbtn(this)" class="fa-solid fa-pen-to-square fa-2x text-primary"></i>
                        <i onclick="onDeletebtn(this)" class="fa-solid fa-trash-can fa-2x text-danger"></i>
                    </div>
                </div>`

        postContainer.prepend(card)
        postForm.reset()
        $('[data-toggle="tooltip"]').tooltip()
        snackbar(`New Post with ID ${res.id} created successfully ...`,'success')

}

function onEditbtn(ele){

    let EDIT_ID=ele.closest('.col-md-3').id

    localStorage.setItem('EDIT_ID',EDIT_ID)

    let EDIT_URL=`${BASE_URL}/posts/${EDIT_ID}`

    makeApiCall('GET',EDIT_URL)
        .then(res=>{

            titleControl.value=res.title;
            bodyControl.value=res.body;
            userIdControl.value=res.userId;

            addBtn.classList.add('d-none')
            updateBtn.classList.remove('d-none')

            postForm.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        })
        .catch(err=>snackbar(err,'error'))
            
}


function onUpdatePostbtn(){

    let UPDATE_ID=localStorage.getItem('EDIT_ID')

    let UPDATE_URL=`${BASE_URL}/posts/${UPDATE_ID}`

    let UPDATE_POST={
         title:titleControl.value,
        body:bodyControl.value,
        userId:userIdControl.value,
        id:UPDATE_ID
    }

    makeApiCall('PATCH',UPDATE_URL,UPDATE_POST)
        .then(res=>{

            
        let card=document.getElementById(res.id)
        card.querySelector('.card-header h3').innerHTML=res.title;
        card.querySelector('.card-body p').innerHTML=res.body;
        let header = card.querySelector('.card-header');

        header.setAttribute('title', res.title);

        $(header).tooltip('dispose');

        $(header).tooltip();
        postForm.reset()
        addBtn.classList.remove('d-none')
        updateBtn.classList.add('d-none')
        localStorage.removeItem('EDIT_ID');
        snackbar(`The Post With ID ${res.id} is Updated ..`,'success')

            card.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            card.classList.add('bgcolor');

            setTimeout(() => {
                card.classList.remove('bgcolor');
            }, 3000);
        })
        .catch(err=>snackbar(err,'error'))
}
 


function onDeletebtn(ele){
    Swal.fire({
  title: "Are you sure?",
  text: "You won't be able to revert this!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "Yes, delete it!"
}).then((result) => {
  if (result.isConfirmed){
            let REMOVE_ID=ele.closest('.col-md-3').id
            let REMOVE_URL=`${BASE_URL}/posts/${REMOVE_ID}`

            makeApiCall('DELETE',REMOVE_URL,null)
                .then(res=>{
                    document.getElementById(REMOVE_ID).remove()
                    snackbar(`The Post with ID ${REMOVE_ID} removed successfully.`,'success')
  })
                .catch(err=>snackbar(err,'error'))
  }
});




}
postForm.addEventListener('submit',onSubmitPost)
updateBtn.addEventListener('click',onUpdatePostbtn)


