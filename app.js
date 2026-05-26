const API_URL =
"https://script.google.com/macros/s/AKfycbwBFakAxDTwrzF6nleMKBhXCBBjfXuuerdmaFgDWWCwLdrsLaRzb_om0Qj7Br9sK3HWhQ/exec";

const feed =
document.getElementById("feed");

const saveUser =
document.getElementById("saveUser");

const usernameInput =
document.getElementById("username");

const postButton =
document.getElementById("postButton");

let currentUser =
localStorage.getItem("foxspace_user");

if (currentUser) {
  usernameInput.value = currentUser;
}

saveUser.addEventListener(
  "click",
  () => {

    const username =
      usernameInput.value.trim();

    if (!username) {
      alert("Digite um nome");
      return;
    }

    localStorage.setItem(
      "foxspace_user",
      username
    );

    currentUser = username;

    alert("Nome salvo!");
  }
);

function processHashtags(text) {

  return text.replace(
    /#(\w+)/g,
    `<span class="hashtag">#$1</span>`
  );
}

async function loadPosts() {

  const postsResponse =
    await fetch(API_URL);

  const commentsResponse =
    await fetch(
      API_URL + "?type=comments"
    );

  const posts =
    await postsResponse.json();

  const comments =
    await commentsResponse.json();

  renderPosts(posts, comments);
}

function renderPosts(posts, comments) {

  feed.innerHTML = "";

  posts.reverse().forEach(post => {

    const postElement =
      document.createElement("div");

    postElement.classList.add("post");

    const postComments =
      comments.filter(
        comment =>
          String(comment.postId) ===
          String(post.id)
      );

    let repostText = "";

    if (post.repost) {
      repostText = `
        <div style="
          color: orange;
          margin-bottom: 10px;
        ">
          🔁 Repost de @${post.repost}
        </div>
      `;
    }

    postElement.innerHTML = `
      ${repostText}

      <div class="post-name">
        @${post.username}
      </div>

      <div class="post-text">
        ${processHashtags(post.text)}
      </div>

      <div class="actions">

        <button class="action-btn">
          ❤️
        </button>

        <button class="repost-btn action-btn">
          🔁
        </button>

      </div>

      <div class="comments"></div>

      <input
        class="comment-input"
        placeholder="Comentar..."
      >

      <button class="send-comment">
        Enviar
      </button>
    `;

    const commentsContainer =
      postElement.querySelector(
        ".comments"
      );

    postComments.forEach(comment => {

      const commentElement =
        document.createElement("div");

      commentElement.classList.add(
        "comment"
      );

      commentElement.innerHTML = `
        <strong>
          @${comment.username}
        </strong>
        <br>
        ${comment.comment}
      `;

      commentsContainer.appendChild(
        commentElement
      );
    });

    const sendComment =
      postElement.querySelector(
        ".send-comment"
      );

    const commentInput =
      postElement.querySelector(
        ".comment-input"
      );

    sendComment.addEventListener(
      "click",
      async () => {

        if (!currentUser) {
          alert(
            "Salve seu nome primeiro!"
          );
          return;
        }

        const comment =
          commentInput.value.trim();

        if (!comment) return;

        await fetch(API_URL, {
          method: "POST",
          body: JSON.stringify({
            type: "comment",
            postId: post.id,
            username: currentUser,
            comment
          })
        });

        loadPosts();
      }
    );

    const repostButton =
      postElement.querySelector(
        ".repost-btn"
      );

    repostButton.addEventListener(
      "click",
      async () => {

        if (!currentUser) {
          alert(
            "Salve seu nome primeiro!"
          );
          return;
        }

        await fetch(API_URL, {
          method: "POST",
          body: JSON.stringify({
            type: "repost",
            username: currentUser,
            text: post.text,
            originalUser: post.username
          })
        });

        loadPosts();
      }
    );

    feed.appendChild(postElement);
  });
}

postButton.addEventListener(
  "click",
  async () => {

    if (!currentUser) {
      alert(
        "Salve seu nome primeiro!"
      );
      return;
    }

    const text =
      document
      .getElementById("postText")
      .value
      .trim();

    if (!text) {
      alert("Digite algo");
      return;
    }

    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        username: currentUser,
        text
      })
    });

    document.getElementById(
      "postText"
    ).value = "";

    loadPosts();
  }
);

loadPosts();