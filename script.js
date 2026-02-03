let posts;
let comments = [];
let currentPostId = null;

async function LoadData() { 
    let res = await fetch("http://localhost:3000/posts")
    posts = await res.json();
    let body = document.getElementById("body_table");
    let listDelete = document.getElementById("list_delete");
    let data = posts.filter(post => post.isDeleted === false);
    body.innerHTML = '';
    for (const post of data) {
        body.innerHTML += `<tr>
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.views}</td>
           <td>
                <input type="submit" value="Delete" onclick="Delete(${post.id})"/>
                <input type="submit" value="Comments" onclick="loadComments('${post.id}')"/>
            </td>
        </tr>`
    }
    let dataDelete = posts.filter(post => post.isDeleted === true);
    for (const post of dataDelete) {
        body.innerHTML += `
        <tr class="deleted-post">
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.views}</td>
            <td>Đã xóa</td>
        </tr>`;
    }

}
async function Save() {
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("view_txt").value;
    if (id !== '') {
        let getItem = await fetch('http://localhost:3000/posts/' + id);
        if (getItem.ok) {
            let post = await getItem.json();
            console.log(getItem);
            let res = await fetch('http://localhost:3000/posts/' + id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    views: views,
                    isDeleted: post.isDeleted
                })
            });
            if (res.ok) {
                console.log("Thanh cong");
            }
        }
        else {
            alert("Không tìm thấy ID: " + id);
        }
    } else {
        try {
            let res = await fetch('http://localhost:3000/posts', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: getNewID(posts).toString(),
                    title: title,
                    views: views,
                    isDeleted: false
                })
            });
            if (res.ok) {
                console.log("Thanh cong");
            }
        } catch (error) {
            console.log(error);
        }
    }
    LoadData();
    return false;
}

//Hàm tạo ID từ maxID
function getNewID(posts) {
    if (posts.length === 0) return 1;
    let maxID = Math.max(...posts.map(post => post.id));
    return maxID + 1;
}

async function Delete(id) {
    console.log("Delete ID: " + id);
    let getItem = await fetch('http://localhost:3000/posts/' + id)
    post = await getItem.json();
    console.log(post);
    let res = await fetch("http://localhost:3000/posts/" + id, {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: post.title,
            views: post.views,
            isDeleted: true
        })
    })
    if (res.ok) {
        console.log("Thanh cong");
    }
    LoadData();
    return false;
}
LoadData();


async function loadComments(postId) {
    currentPostId = postId;
    let res = await fetch(`http://localhost:3000/comments?postId=${postId}`);
    comments = await res.json();

    let commentDiv = document.getElementById("comment_list");
    if (!commentDiv) return;

    commentDiv.innerHTML = "";

    comments
        .filter(c => c.isDeleted === false)
        .forEach(c => {
            commentDiv.innerHTML += `
                <div>
                    ${c.text}
                    <button onclick="editComment('${c.id}')">Edit</button>
                    <button onclick="deleteComment('${c.id}')">Delete</button>
                </div>
            `;
        });
}

async function addComment(postId, text) {
    let res = await fetch("http://localhost:3000/comments");
    let allComments = await res.json();

    await fetch("http://localhost:3000/comments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: getNewID(allComments).toString(),
            postId: postId,
            text: text,
            isDeleted: false
        })
    });

    loadComments(postId);
}

async function editComment(id) {
    let res = await fetch(`http://localhost:3000/comments/${id}`);
    let comment = await res.json();

    let newText = prompt("Nội dung mới:", comment.text);
    if (newText === null) return;

    await fetch(`http://localhost:3000/comments/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            ...comment,
            text: newText
        })
    });

    loadComments(comment.postId);
}

async function deleteComment(id) {
    let res = await fetch(`http://localhost:3000/comments/${id}`);
    let comment = await res.json();

    await fetch(`http://localhost:3000/comments/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            ...comment,
            isDeleted: true
        })
    });

    loadComments(comment.postId);
}

function addCommentFromUI() {
    let text = document.getElementById("comment_text").value;

    if (!currentPostId) {
        alert("Vui lòng chọn post trước!");
        return;
    }

    if (text.trim() === "") {
        alert("Comment không được để trống");
        return;
    }

    addComment(currentPostId, text);
    document.getElementById("comment_text").value = "";
}

