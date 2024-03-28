

(() => {
  // These values must be updated when required
  const extAPI = chrome || browser; // chrome / browser
  const extVersion = "2.2.4";
  const idbName = 'CAITools';
  const idbVersion = 1;
  const extensionUrl = extAPI.runtime.getURL('');

  const metadata = {
    version: 1,
    created: Date.now(),
    modified: Date.now(),
    source: null,
    tool: {
      name: "CAI Tools",
      version: extVersion,
      url: "https://www.github.com/irsat000/CAI-Tools"
    }
  };

  // Design tools font data
  const dtFontList = [
    { name: "Roboto", style: `"Roboto", sans-serif` },
    { name: "Josefin Sans", style: `"Josefin Sans", sans-serif` },
    { name: "Jetbrains Mono", style: `"Jetbrains Mono", sans-serif` },
    { name: "Open Sans", style: `"Open Sans", sans-serif` },
    { name: "Montserrat", style: `"Montserrat", sans-serif` },
    { name: "Montserrat Alternates", style: `"Montserrat Alternates", sans-serif` },
    { name: "Lato", style: `"Lato", sans-serif` },
    { name: "PT Sans", style: `"PT Sans", sans-serif` },
    { name: "Nunito Sans", style: `"Nunito Sans", sans-serif` },
    { name: "Courier Prime", style: `"Courier Prime", monospace` },
    { name: "Averia Serif Libre", style: `"Averia Serif Libre", serif` }
  ]
  const dtFancyFontList = [
    { name: "Anime Ace", style: `"Anime Ace", cursive` },
    { name: "Manga Temple", style: `"Manga Temple", cursive` },
    { name: "Dancing Script", style: `"Dancing Script", cursive` },
    { name: "Enfantine", style: `"Enfantine", cursive` },
    { name: "Kirsty", style: `"Kirsty", cursive` },
    { name: "Planewalker", style: `"Planewalker", cursive` },
    { name: "Medieval Sharp", style: `"Medieval Sharp", cursive` },
    { name: "Berenika Book", style: `"Berenika Book", cursive` },
    { name: "Klaudia", style: `"Klaudia", cursive` }
  ]

  // Google fonts preconnect
  let gPreLink1 = document.createElement('link');
  gPreLink1.rel = 'preconnect';
  gPreLink1.href = 'https://fonts.googleapis.com';
  let gPreLink2 = document.createElement('link');
  gPreLink2.rel = 'preconnect';
  gPreLink2.href = 'https://fonts.gstatic.com';
  gPreLink2.crossOrigin = 'anonymous';
  let gFontsLink = document.createElement('link');
  gFontsLink.rel = 'stylesheet';
  let googleFontLink = `https://fonts.googleapis.com/css2?`;
  googleFontLink += `
        family=Averia+Serif+Libre:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Montserrat+Alternates:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900
    `.trim();
  googleFontLink += `&family=Dancing+Script:wght@400..700`;
  googleFontLink += `&display=swap`;
  gFontsLink.href = googleFontLink;

  // Insert local fonts
  fetch(`${extensionUrl}style/fonts.css`)
    .then(res => res.text())
    .then(cssContent => {
      // Modify the font URL using a regular expression
      const modifiedCss = cssContent.replace(/_URL_/g, `${extensionUrl}assets/fonts`);
      // Set and append
      const style = document.createElement('style');
      style.innerHTML = modifiedCss;
      document.head.appendChild(style);
    })
    .catch(error => console.error('Error fetching CSS file:', error));

  // xhook + wsHook
  const intercept_lib__url = `${extensionUrl}scripts/intercept.js`;
  const interceptHookScript = document.createElement("script");
  interceptHookScript.crossOrigin = "anonymous";
  interceptHookScript.id = "xhook";
  interceptHookScript.onload = function () {
  };
  interceptHookScript.src = intercept_lib__url;
  // Insert both hooks
  const firstScript = document.getElementsByTagName("script")[0];
  firstScript.parentNode.insertBefore(interceptHookScript, firstScript);
  // Insert google font links
  firstScript.parentNode.append(gPreLink1);
  firstScript.parentNode.append(gPreLink2);
  firstScript.parentNode.append(gFontsLink);


  // Listen to background message
  /*extAPI.runtime.onMessage.addListener(function (request, sender) {
      if (request.type === "log") {
          console.log(request.message);
      }
  });*/


  // MutationObserver for right panel
  let rightPanelObserver;

  // Run at refresh or start as well
  handleLocationChange(null, { lastHref: '' });
  // A function to handle mutations
  function handleLocationChange(mutationsList, observer) {
    // Check if the URL has changed
    if (window.location.href !== observer.lastHref) {
      observer.lastHref = window.location.href;

      // Reset right menu observer, otherwise it will stack
      if (rightPanelObserver) {
        rightPanelObserver.disconnect();
        rightPanelObserver = undefined;
      }
      // Clean cai tools elements to make way for new ones
      cleanDOM();
      const custombg = document.querySelector('#custombg');
      if (custombg) {
        custombg.remove();
      }
      document.body.classList.remove('custombg-mode');
      // Perform actions based on the URL change
      const location = getPageType();
      // If new design
      if (location === 'redesignChat') {
        initialize_caitools();
        initialize_designtools();
        apply_custombg();
        apply_bgPrompt();
      }
      // If chat2
      else if (location === "chat2Chat") {
        initialize_caitools();
        apply_custombg();
        apply_bgPrompt();
      }
      // If legacy chat
      else if (location === "legacyChat") {
        initialize_caitools();
      }
      // If main page
      else if (location === "oldMainPage" || location === "mainPage") {
        // Initialize indexedDB to prevent need for refresh
        caiToolsDB();
        // Handle patreon callback
        const url = new URL(window.location.href);
        const patreonCode = url.searchParams.get('code');
        const patreonState = url.searchParams.get('state');
        // Check if callback
        if (patreonCode && patreonState) {
          handlePatreonLogin(patreonCode);
          setTimeout(() => {
            url.searchParams.delete('code');
            url.searchParams.delete('state');
            window.history.replaceState({}, document.title, url);
          }, 2000)
        }
      }
      else {

      }
    }
  }
  // Create a MutationObserver instance
  const locationObserver = new MutationObserver(handleLocationChange);
  // Initialize the lastHref property
  locationObserver.lastHref = window.location.href;
  // Observe changes to the window.location.href
  locationObserver.observe(document, {
    childList: true,
    attributes: false,
    subtree: true,
    characterData: false
  });

  function handlePatreonLogin(patreonCode) {
    getPatreonPledgeInfo(patreonCode)
      .then((data) => {
        const { status, daysLeft } = data;
        // console.log("The membership status: " + status + " Days left: " + daysLeft);

        if (getCookie('cait_premium')) {
          alert("Your CAI Tools is already unlocked.");
          return;
        }
        // paid | free_trial | free_trial_granted | free_trial_expired | none
        if (status === "free_trial_granted") {
          setCookie('cait_premium', 'freeTrial', 7);
          alert("Enjoy the 7-day free trial.");
        }
        else if (status === "free_trial") {
          setCookie('cait_premium', 'freeTrial', daysLeft);
          alert("Enjoy the free trial. Remaining days: " + daysLeft);
        }
        else if (status === "paid") {
          setCookie('cait_premium', 'unlocked', daysLeft);
          alert("Premium is active!");
        }
        else if (status === "free_trial_expired") {
          alert("Your free trial has expired.");
        }
        else if (status === "none") {
          alert("Paid membership on Patreon not found. Join for FREE to get 7-day free trial!");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Couldn't fetch Patreon info. Error: " + err)
      });
  }


  // Reveal memory text
  document.addEventListener('click', (e) => {
    const el = e.target;
    if (el.matches('a[href="#-"], a[title]') && el.textContent === "-") {
      e.preventDefault();
      el.textContent = el.getAttribute('title');
      el.dataset.revealed_memory = true;
    } else if (el.dataset.revealed_memory) {
      e.preventDefault();
    }
  });


  // FETCH and LOADING ACTIONS
  function applyConversationMeta(converExtId, newSimplifiedChat) {
    if (document.querySelector(`meta[cai_converExtId="${converExtId}"]`)) {
      document.querySelector(`meta[cai_converExtId="${converExtId}"]`)
        .setAttribute('cai_conversation', JSON.stringify(newSimplifiedChat));
    }
    else {
      const meta = document.createElement('meta');
      meta.setAttribute('cai_converExtId', converExtId);
      meta.setAttribute('cai_conversation', JSON.stringify(newSimplifiedChat));
      document.head.appendChild(meta);
    }
    handleProgressInfo(`(Ready!)`);
    console.log("FINISHED", newSimplifiedChat);
  }

  const fetchMessagesLegacy = async ({ AccessToken, nextPage, converExtId, chatData, fetchDataType }) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    let url = `https://${getMembership()}.character.ai/chat/history/msgs/user/?history_external_id=${converExtId}`;
    if (nextPage > 0) {
      url += `&page_num=${nextPage}`;
    }

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          "authorization": AccessToken
        }
      });
      if (res.ok) {
        const data = await res.json();
        chatData.turns = [...data.messages, ...chatData.turns];

        if (data.has_more == false) {
          const newSimplifiedChat = [];
          chatData.turns.filter(m => m.is_alternative == false && m.src__name != null).forEach((msg) => {
            const newSimplifiedMessage = {
              name: msg.src__name,
              message: msg.text,
              isHuman: msg.src__is_human
            }
            newSimplifiedChat.push(newSimplifiedMessage);
          });

          if (fetchDataType === "conversation") {
            applyConversationMeta(converExtId, newSimplifiedChat);
          }
          else if (fetchDataType === "history") {
            chatData.history = newSimplifiedChat;
            chatData.turns = [];
          }

          return;
          // This was the last fetch for the chat
        }

        await fetchMessagesLegacy({
          AccessToken: AccessToken,
          nextPage: data.next_page,
          converExtId: converExtId,
          chatData: chatData,
          fetchDataType: fetchDataType
        });
      }
      else if (res.status === 429) {
        console.log("Rate limitting error. Will continue after 10 seconds.");
        await new Promise(resolve => setTimeout(resolve, 10000));
        return await fetchMessagesLegacy({
          AccessToken: AccessToken,
          nextPage: nextPage,
          converExtId: converExtId,
          chatData: chatData,
          fetchDataType: fetchDataType
        });
      }
      else
        throw res;
    } catch (error) {
      alert("Unexpected CAI Tools error, please report on Github");
      console.error("Unexpected CAI Tools error: " + error);
    }
  };

  const fetchMessagesChat2 = async ({ AccessToken, nextToken, converExtId, chatData, fetchDataType }) => {
    //Will be similar to fetchMessages. Next token will come from the previous fetch.
    //Last chat will give next token too.
    //New fetch will repond with null next_token variable and empty turns.
    await new Promise(resolve => setTimeout(resolve, 200));
    let url = `https://neo.character.ai/turns/${converExtId}/`;

    try {
      const res = await fetch(url + (nextToken ? `?next_token=${nextToken}` : ""), {
        "method": "GET",
        "headers": {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          "authorization": AccessToken,
        }
      })
      if (res.ok) {
        const data = await res.json();
        if (data.meta.next_token == null) {
          const newSimplifiedChat = [];
          chatData.turns.forEach((msg) => {
            const primaryMessage = msg.candidates.find(c => c.candidate_id === msg.primary_candidate_id);
            const newSimplifiedMessage = {
              name: msg.author.name,
              message: primaryMessage ? primaryMessage.raw_content : msg.candidates[msg.candidates.length - 1].raw_content,
              isHuman: !!msg.author.is_human
            }
            newSimplifiedChat.push(newSimplifiedMessage);
          });

          newSimplifiedChat.reverse();

          if (fetchDataType === "conversation") {
            applyConversationMeta(converExtId, newSimplifiedChat);
          }
          else if (fetchDataType === "history") {
            chatData.history = newSimplifiedChat;
            chatData.turns = [];
          }

          return;
          // If next_token is null, stops function and prevents calling function more
          // This was the last fetch for the chat
        }

        chatData.turns = [...chatData.turns, ...data.turns];

        await fetchMessagesChat2({
          AccessToken: AccessToken,
          nextToken: data.meta.next_token,
          converExtId: converExtId,
          chatData: chatData,
          fetchDataType: fetchDataType
        });
      }
      else if (res.status === 429) {
        console.log("Rate limitting error. Will continue after 10 seconds.");
        await new Promise(resolve => setTimeout(resolve, 10000));
        return await fetchMessagesChat2({
          AccessToken: AccessToken,
          nextToken: nextToken,
          converExtId: converExtId,
          chatData: chatData,
          fetchDataType: fetchDataType
        });
      }
      else
        throw res;
    } catch (error) {
      alert("Unexpected CAI Tools error, please report on Github");
      console.error("Unexpected CAI Tools error: " + error);
    }
  }

  const fetchHistory = async () => {
    const AccessToken = getAccessToken();
    const charId = getCharId();
    // Safety check
    if (!AccessToken || !charId) {
      return;
    }
    let meta = document.querySelector('meta[cai_charId="' + charId + '"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('cai_charId', charId);
      document.head.appendChild(meta);
    }
    // Check if fetching process already started for this character
    if (meta.getAttribute('fetchHistStarted')) {
      if (meta.getAttribute('cai_history')) {
        handleProgressInfoHist(`(Ready!)`);
      }
      return;
    }
    meta.setAttribute('fetchHistStarted', 'true');
    document.querySelector('.cai_tools-cont .fetchHistory-btn').classList.add('started');

    // Fetch chat lists from legacy and new
    let chatList = [];
    try {
      const res_legacy = await fetch(`https://${getMembership()}.character.ai/chat/character/histories_v2/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          "authorization": AccessToken
        },
        body: JSON.stringify({
          external_id: charId,
          number: 999
        })
      })
      const res_new = await fetch(`https://neo.character.ai/chats/?character_ids=${charId}&num_preview_turns=2`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          "authorization": AccessToken
        }
      })
      if (res_legacy.ok) {
        const data = await res_legacy.json();
        if (data.histories) {
          // Filter the empty chats
          data.histories = data.histories.filter(chat => chat.msgs?.length > 1 || false);
          // Add to list
          chatList.push(...data.histories.map(chat => ({ id: chat.external_id, date: new Date(chat.created), type: "legacy" })));
        }
      }
      if (res_new.ok) {
        const data = await res_new.json();
        if (data.chats) {
          // Filter the empty chats
          data.chats = data.chats.filter(chat => chat.preview_turns?.length > 1 || false);
          // Add to list
          chatList.push(...data.chats.map(chat => ({ id: chat.chat_id, date: new Date(chat.create_time), type: "chat2" })));
        }
      }
    } catch (error) {
      console.log("CAI Tools error: " + error);
    }

    if (!chatList.length) {
      alert("No history found.");
      return;
    }

    // Sort by date in descending order, new chats first
    chatList.sort((a, b) => b.date - a.date);

    // Fetching process data
    let finalHistory = [];
    let fetchedChatNumber = 1;
    const historyLength = chatList?.length || 0;

    // Fetch history
    for (const chatInfo of chatList) {
      const { id, date, type } = chatInfo;
      const chatData = { history: [], turns: [] }

      if (type === "legacy") {
        await fetchMessagesLegacy({
          AccessToken: AccessToken,
          nextPage: 0,
          converExtId: id,
          chatData: chatData,
          fetchDataType: "history"
        });
      } else {
        await fetchMessagesChat2({
          AccessToken: AccessToken,
          nextToken: null,
          converExtId: id,
          chatData: chatData,
          fetchDataType: "history"
        });
      }
      // Add to final
      finalHistory.push({ date: date, chat: chatData.history });
      // Increase the fetched index
      fetchedChatNumber++;
      // Update the informative text
      handleProgressInfoHist(`(Loading history... ${fetchedChatNumber}/${historyLength})`);
    }

    // Save history in meta tag
    meta.setAttribute('cai_history', JSON.stringify(finalHistory));
    // Update the informative text
    handleProgressInfoHist(`(Ready!)`);
    console.log("FINISHED", finalHistory);
  };

  const fetchConversation = async (converExtId) => {
    const AccessToken = getAccessToken();
    if (!AccessToken) return; // Not necessary because we check it before that already
    const chatData = { history: [], turns: [] };
    let args = {
      AccessToken: AccessToken,
      converExtId: converExtId,
      chatData: chatData,
      fetchDataType: "conversation"
    };

    const location = getPageType();
    // If new design or chat2
    if (location === 'redesignChat' || location === "chat2Chat") {
      args.nextToken = null;
      await fetchMessagesChat2(args);
    }
    // If legacy chat
    else if (location === "legacyChat") {
      args.nextPage = 0;
      await fetchMessagesLegacy(args);
    }
  }

  // FETCH END


  // CAI Tools - DOM

  function msgInputEventListenerForBg(data, messageInput, box) {
    return function () {
      // Trim the input
      const userInput = messageInput.value.trim();
      // If it starts with ## and there is more input
      if (userInput.startsWith('##') && userInput.length > 2) {
        box.style.visibility = "visible"; // Show box
        const enteredKeyword = userInput.substring(2).toLowerCase(); // Key chars after ##
        // Filter keywords
        const matchingKeywords = Array.from(data).filter(keyword =>
          keyword.toLowerCase().startsWith(enteredKeyword)
        );
        // Show all the matching keywords
        box.innerHTML = `
                    ${matchingKeywords.length > 0 ? matchingKeywords.map(k => `<li>${k}</li>`).join('') : '<span>No matching</span>'}
                `;
      }
      else if (box) {
        box.style.visibility = "hidden"; // Check box and hide
      }
    };
  }

  // Register keyup listener outside to be able to remove the event listener later (dumbest design ever)
  let keyupListener;

  function apply_bgPrompt() {
    // Check premium
    if (!checkPremium()) {
      return;
    }

    // Try until the parent element is ready
    let attempts = 0;
    const waitUntilMessageInput = setInterval(async () => {
      const location = getPageType();
      if (!location || location === "mainPage") {
        clearInterval(waitUntilMessageInput);
        return;
      }
      // 15 seconds timeout
      attempts++;
      if (attempts > 30) {
        clearInterval(waitUntilMessageInput);
        console.log("CAI Tools couldn't find message input. The UI has probably been changed.");
      }
      apply();
    }, 500);

    function apply() {
      let messageInput;
      updateMessageInput();
      function updateMessageInput() {
        messageInput = document.querySelector('textarea[placeholder="Type a message"]#user-input') ?? document.querySelector('textarea[placeholder^="Message"]');
      }
      if (!messageInput) {
        return;
      }
      clearInterval(waitUntilMessageInput);

      // Get all keywords
      caiToolsDB({ type: "getKeywordList" }, (data) => {
        // Remove the event listener if it was previously added
        if (keyupListener) {
          messageInput.removeEventListener('keyup', keyupListener);
        }
        // If data is false, then it's because roleplayBgActive is not true
        if (!data) {
          let box = messageInput.parentNode.querySelector('#keywordBox');
          if (box) box.remove(); // Remove box
          return;
        }
        // Else, data is a set of keywords

        // Make a prompt depending on the entered keyword
        let box = messageInput.parentNode.querySelector('#keywordBox');
        if (box) {
          box.remove(); // Get rid of event listeners
        }
        // Create new
        box = document.createElement('ul');
        box.id = 'keywordBox';
        // When clicked on tags, apply background and reset fields
        box.addEventListener('click', (e) => {
          const li = e.target;
          if (li.tagName.toLowerCase() === 'li') {
            // Get image by keyword
            caiToolsDB({ type: "getRoleplayBg", keyword: li.textContent }, (item) => {
              if (item) {
                box.style.visibility = "hidden";
                //messageInput.value = ''; // Doesn't work probably because it's a state
                // Change bg
                apply_custombg(item.img);
              } else {
                alert("Image not found, if you can't figure out why, please report.")
              }
            });
          }
        });
        setTimeout(() => {
          updateMessageInput();
          // Insert box right after message input
          // Is necessary for chat2 because of the + in css and input's sibling is a button
          messageInput.insertAdjacentElement('afterend', box);
          // messageInput.parentNode.insertBefore(box, messageInput.nextSibling); // Alternative

          // Assign the event listener to the variable
          keyupListener = msgInputEventListenerForBg(data, messageInput, box);
          // When key up
          messageInput.addEventListener('keyup', keyupListener);
        }, 1500);
      });
    }
  }

  function apply_custombg(bgMedia) {
    // Check premium
    if (!checkPremium()) {
      return;
    }

    // Try until the parent element is ready
    let attempts = 0;
    const waitUntilMain = setInterval(() => {
      // 15 seconds timeout
      attempts++;
      if (attempts > 30) {
        clearInterval(waitUntilMain);
      }
      apply();
    }, 500);

    async function apply() {
      try {
        const parentEl = document.querySelector('BODY'); // document.querySelector('main')?.parentNode;
        if (!parentEl) return;
        clearInterval(waitUntilMain);
        // Check #custombg and hide
        let bg = parentEl.querySelector('#custombg');
        if (bg) {
          bg.style.opacity = '0';
          parentEl.classList.remove('custombg-mode');
          await new Promise(resolve => setTimeout(resolve, 500));
          bg.innerHTML = "";
          bg.style.backgroundImage = "";
        } else {
          // Create #custombg, a new background image
          bg = document.createElement('div');
          bg.id = "custombg";
          bg.setAttribute('data-tool', 'cai_tools_1');
          bg.style.opacity = '0';
          // Append to the start of parent
          parentEl.insertBefore(bg, parentEl.firstChild);
        }

        // If directly applied
        if (bgMedia) {
          // Change background image
          const imgData = await getMediaDataFromUrl(bgMedia);
          if (!imgData) return;
          const { mimeType, media } = imgData;
          if (mimeType.startsWith('video/')) {
            // data url - url to video
            bg.innerHTML = `<video autoplay muted loop><source src="${media}" type="${mimeType}"></video>`;
          } else {
            // data url | url to image
            bg.style.backgroundImage = `url(${media})`;
          }
          // Wait just a tiny bit to let opacity register as transition
          setTimeout(() => {
            bg.style.opacity = '1';
            // Give this class to body for main.css to work with right panel and message boxes
            parentEl.classList.add('custombg-mode');
          }, 50);
        }
        else {
          caiToolsDB({ type: "getMainBg" }, async (bgInfo) => {
            // If not active, stop after removing the #custombg
            if (!bgInfo.mainBgActive) {
              bg.style.backgroundImage = 'unset';
              return;
            }
            // Change background image
            const imgData = await getMediaDataFromUrl(bgInfo.mainBg);
            if (!imgData) return;
            const { mimeType, media } = imgData;
            if (mimeType.startsWith('video/')) {
              bg.innerHTML = `<video autoplay muted loop><source src="${media}" type="${mimeType}"></video>`;
            } else {
              bg.style.backgroundImage = `url(${media})`;
            }
            // Wait just a tiny bit to let opacity register as transition
            await new Promise(resolve => setTimeout(resolve, 50));
            bg.style.opacity = '1';
            // Give this class to body for main.css to work with right panel and message boxes
            parentEl.classList.add('custombg-mode');
          });
        }
      } catch (error) {
        alert("Error while applying background. Please check console from F12.");
        console.log("CAI Tools error, background couldn't be applied. Error: " + error);
      }
    }
  }

  async function getMediaDataFromUrl(url) {
    return new Promise(async (resolve, reject) => {
      try {
        // Check if it's a data URL
        if (url.startsWith('data:')) {
          const data = {
            mimeType: url.split(':')[1].split(';')[0],
            media: await urlToObjectURL(url)
          }
          resolve(data);
        } else {
          // If it's a regular URL, fetch the resource and determine its MIME type
          fetch(url, { method: 'HEAD' })
            .then(async (response) => {
              const contentType = response.headers.get('content-type');
              const data = {
                mimeType: contentType.split(';')[0],
                media: url
              }
              resolve(data);
            })
            .catch(error => {
              console.log("Error while fetching background:", error);
              resolve(null);
            });
        }
      } catch (error) {
        console.log("Error at getMediaDataFromUrl:", error);
        resolve(null);
      }
    });
  }

  function initialize_designtools(modalBody) {
    // Import to panels only if it's premium
    if (checkPremium() && !modalBody) {
      let desktopPanelFound = false;
      let mobilePanelState = false;
      // Observe Mobile version of the right panel
      rightPanelObserver = new MutationObserver(() => {
        // Check mobile
        const mobilePanel = document.querySelector('BODY > [data-state="open"]');
        // Make sure it's the right panel I am looking for with "New chat" text in the innerHTML
        // Also check if CAI Tools is already added
        if (mobilePanel && !mobilePanelState && mobilePanel.innerHTML.includes("New chat")) {
          mobilePanelState = true;
          importDesignTools(mobilePanel);
        } else if (!mobilePanel && mobilePanelState) {
          mobilePanelState = false;
        }
        // Check desktop
        if (!desktopPanelFound) {
          const desktopPanel = document.querySelector('main > * > .size-full > .h-full');
          if (desktopPanel && desktopPanel.innerHTML.includes("New chat") && !desktopPanel.innerHTML.includes('cait_design_tools')) {
            desktopPanelFound = true;
            importDesignTools(desktopPanel);
          }
        }
        // Mobile panel is removed and added again, hence we can't stop observing
        // Disconnect observer if both are found
        /*
        if (!mobilePanelFound) {
            mobilePanelFound = true;
        }
        
        if (mobilePanelFound && desktopPanelFound) {
            rightPanelObserver.disconnect();
        }*/
      });
      rightPanelObserver.observe(document.body, { childList: true, subtree: true });
    }
    else if (modalBody) {
      importDesignTools(modalBody);
    }

    function importDesignTools(container) {
      // Set overflow to auto for UX
      container.style.overflowY = "auto";
      // INITIALIZE SETTINGS
      caiToolsDB({ type: "getDesignSettings" }, (data) => {
        const settings = data.settings;
        console.log("CAI Tools retrieved font settings:", settings);
        // Write content
        const designToolsCont = document.createElement('DIV');
        designToolsCont.classList.add('cait_design_tools');
        designToolsCont.setAttribute('data-tool', 'cai_tools_1');
        // <h4>CAI Tools</h4>
        designToolsCont.innerHTML = `
                    <div class="dt-body">
                        <hgroup>
                            <span>Font size(px):</span>
                            <input type="number" placeholder="16" value="${settings.fontSize}" class="dt-fontsize">
                        </hgroup>
                        <select class="dt-font">
                            <option value='default'>Default</option>
                            <optgroup label="Normal">
                                ${dtFontList.map(f => (`<option value='${f.style}' style='font-family: ${f.style} !important;' ${f.style === settings.fontStyle ? 'selected' : ''}>${f.name}</option>`)).join('')}
                            </optgroup>
                            <optgroup label="Fancy">
                                ${dtFancyFontList.map(f => (`<option value='${f.style}' style='font-family: ${f.style} !important;' ${f.style === settings.fontStyle ? 'selected' : ''}>${f.name}</option>`)).join('')}
                            </optgroup>
                        </select>
                    </div>
                `;

        designToolsCont.querySelector('.dt-fontsize').addEventListener('change', (e) => {
          // If not premium, prevent input from changing and inform the user
          if (!checkPremium()) {
            e.currentTarget.value = '16';
            alert("Premium required.")
            return;
          }
          const val = e.target.value;
          // Apply
          createStyle(val, 'size');
          document.querySelectorAll('.dt-fontsize').forEach(el => el.value = val);
          // Save
          caiToolsDB({ type: "saveDesignSettings", fontSize: val })
        })

        designToolsCont.querySelector('.dt-font').addEventListener('change', (e) => {
          // If not premium, prevent input from changing and inform the user
          if (!checkPremium()) {
            e.currentTarget.value = 'default';
            alert("Premium required.")
            return;
          }
          const val = e.target.value;
          // Apply
          createStyle(val);
          document.querySelectorAll('.dt-font').forEach(el => el.value = val);
          // Save
          caiToolsDB({ type: "saveDesignSettings", fontStyle: val })
        })

        // Insert to top
        container.appendChild(designToolsCont);

        // Apply at the start
        if (checkPremium()) {
          createStyle(settings.fontSize, "size");
          createStyle(settings.fontStyle);
        }
      });

      function createStyle(val, type) {
        let styleElement;
        const styleElId = type === 'size' ? 'designtools_fontSize' : 'designtools_fontStyle';
        // Get existing style or create a style
        if (document.getElementById(styleElId)) {
          styleElement = document.getElementById(styleElId);
        } else {
          styleElement = document.createElement('style');
          styleElement.id = styleElId;
          document.head.appendChild(styleElement);
        }

        // Define the CSS rule for the custom font class
        if (val === 'default') {
          styleElement.innerHTML = '';
        }
        else if (type === 'size') {
          styleElement.innerHTML = `
                        main main p[node],
                        main main textarea[maxlength="4092"],
                        .chat2 > div:nth-child(2) p[node],
                        .chat2 > div:nth-child(2) textarea {
                            font-size: ${val}px !important;
                        }
                    `;
        }
        else {
          styleElement.innerHTML = `
                        main main p[node],
                        main main textarea[maxlength="4092"],
                        .chat2 p[node],
                        .chat2 textarea,
                        textarea[placeholder^="Message "],
                        textarea[placeholder="Type a message"] {
                            font-family: ${val} !important;
                        }
                    `;
        }
      }
    }
  }
  /*
      <button type="button" class="save">Save</button>

      <li>
          <div class="bg_item_actions">
              <input data-val="keyword_1" value="keyword_1" class="bg_item_keyword" type="text" placeholder="keyword,keyword" />
              <span class="bg_item_delete">Delete</span>
          </div>
          <div class="bgimg-cont">
              <img src="https://t3.ftcdn.net/jpg/05/40/81/44/360_F_540814436_Q6aTo0ih7DA9RozDSTiGqJMMnYkdKQY1.jpg" />
          </div>
      </li>
  */

  function initialize_caitools() {
    const BODY = document.getElementsByTagName('BODY')[0];

    let redirectURI = 'https://character.ai/';
    if (getSiteVersion() !== 'redesign' && getSiteVersion() !== 'unknown') {
      redirectURI = 'https://' + window.location.hostname + '/'
    }

    // CAI TOOLS Elements
    const cai_tools_string = `
            <div class="cait_button-cont" data-tool="cai_tools">
                <div class="dragCaitBtn">&#9946;</div>
                <button class="cai_tools-btn">CAI Tools</button>
            </div>
            <div class="cai_tools-cont" data-tool="cai_tools">
                <div class="cai_tools">
                    <div class="cait-header">
                        <h4>CAI Tools</h4><span class="cait-close">x</span>
                    </div>
                    <a href="https://www.patreon.com/Irsat" target="_blank" class="donate_link">Support me on Patreon</a>
                    ${!checkPremium() ? `
                        <span class="patreon-note">Join for free on Patreon to get 7-day free trial.</span>
                    ` : ''}
                    <div class="patreon-actions">
                        <button type="button" class="cait_patreon_link" onclick='window.open("https://www.patreon.com/Irsat", "_blank");'>
                            Patreon
                        </button>
                        ${!checkPremium() ? `
                            <button type="button" class="cait_patreon_login" onclick='location.href="https://patreon.com/oauth2/authorize?client_id=yR87_-fLISfmdt2p3Hy-Fgi2SAwgYnbbJY7TvasREPwodBc8V-sGnlXj-9R1sSV3&response_type=code&redirect_uri=${redirectURI}";'>
                                Unlock Premium
                            </button>
                        ` : ''}
                    </div>
                    <div class="cait-body">
                        <span class="cait_warning"></span>
                        <input type="file" class="cait_import" accept="application/json, image/png" />
                        <ul>
                            <li data-cait_type='import_a_character'>Import a Character (json/card)</li>
                            <li data-cait_type='background_manager'>Background manager</li>
                            <li data-cait_type='font_manager'>Font manager</li>
                        </ul>
                        <h6>Character</h6>
                        <ul>
                            <li data-cait_type='memory_manager'>Memory Manager</li>
                            <li data-cait_type='character_hybrid'>Character (json)</li>
                            <li data-cait_type='character_card'>Character Card (png)</li>
                            <li data-cait_type='character_settings'>Show settings</li>
                            <li data-cait_type='character_copy'>Create Private Copy</li>
                        </ul>
                        <h6>This conversation</h6>
                        <span class='cait_progressInfo'>(Loading...)</span>
                        <ul>
                            <li data-cait_type='cai_duplicate_chat'>Create Duplicate <i>(Last 100 msgs)</i></li>
                            <li data-cait_type='cai_duplicate_chat_full'>Create Duplicate <i>(Full)</i></li>
                            <li data-cait_type='cai_offline_read'>Offline Chat</li>
                            <li data-cait_type='example_chat'>Chat as Definition</li>
                            <li data-cait_type='oobabooga'>Oobabooga chat</li>
							<li data-cait_type='tavern'>Tavern chat</li>
                        </ul>
                        <h6>History</h6>
                        <div class="history_loading-cont">
                            <button type="button" class="fetchHistory-btn">Start fetch</button>
                            <span class='cait_progressInfo_Hist'>(Waiting command...)</span>
                        </div>
                        <ul>
                            <li data-cait_type='cai_hist_offline_read'>Offline History</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="cait_settings-cont" data-tool="cai_tools">
                <div class="cait_settings">
                    <div class="caits_header">
                        <h4>Settings</h4><span class="caits-close">x</span>
                    </div>
                    <div class="caits-body">
                        <div class="caits-content">
                        </div>
                    </div>
                </div>
            </div>
            <div class="cait_memory_manager-cont" data-tool="cai_tools" data-import_needed="true">
                <div class="cait_memory_manager">
                    <div class="caitmm_header">
                        <h4>Memory Manager</h4><span class="caitmm-close">x</span>
                    </div>
                    <div class="caitmm-body">
                        <label class="mm_status">Active <input type="checkbox" name="cait_mm_active" unchecked /></label>
                        <span class="note">Note: 0 frequency means every message.</span>
                        <span class="reminder-wrap">
                            Remind every <input type="number" name="remind_frequency" value="5" min="0" max="100" /> messages
                        </span>
                        <textarea class="mm_new_memory" name="new_memory" placeholder='New memory (Line breaks are not recommended but will work) (Click "Add New" and "Save")'></textarea>
                        <button type="button" class="add_new_memory">Add New</button>
                        <ul class="mm-current_memory_list">
                        </ul>
                        <div class="mm-action-cont">
                            <button type="button" class="cancel">Cancel</button>
                            <button type="button" class="save">Save</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="cait_font_manager-cont cait_modal_cont" data-tool="cai_tools">
                <div class="cait_memory_manager cait_modal_box">
                    <div class="cait_modal_header">
                        <h4>Font Manager ${!checkPremium() ? `<i>(Premium required)</i>` : ''}</h4><span class="cait_modal_close">x</span>
                    </div>
                    <div class="cait_modal_body">
                    </div>
                </div>
            </div>
            <div class="cait_bg_manager-cont" data-tool="cai_tools">
                <div class="cait_bg_manager">
                    <div class="caitbgm_header">
                        <h4>Background Manager ${!checkPremium() ? `<i>(Premium required)</i>` : ''}</h4><span class="caitbgm-close">x</span>
                    </div>
                    <div class="caitbgm-body">
                        <div class="bgm-action-cont">
                            <div class="bgm_main_status-cont">
                                <label class="bgm_main_status">Main Background <input type="checkbox" name="bgm_main_active" unchecked /></label>
                                <input type="file" class="import_main_bg" accept="image/*,video/*" />
                                <div class="bgm_main_link-cont">
                                    <input type="text" class="main_bg_url" placeholder="Link to Image, Gif or Video(new)" />
                                    <button type="button" class="main_bg_url_submit">Use link</button>
                                </div>
                            </div>
                            <div class="bgm_roleplay_status-cont">
                                <label class="bgm_roleplay_status">Roleplay Background <input type="checkbox" name="bgm_roleplay_active" unchecked /></label>
                                <a href="https://i.imgur.com/2wHduJ1.gif" target="_blank">How to use</a>
                            </div>
                        </div>
                        <h4 class="list-header">Your list</h4>
                        <div class="add-new-cont">
                            <div class="add-new-row">
                                <input type="text" class="cait_new_bg_keyword" placeholder="keyword1,keyword2" />
                                <button type="button" class="add_new_bg">Add New</button>
                            </div>
                            <input type="text" class="import_roleplay_bg_url" placeholder="Link to Image, Gif or Video(new)" />
                            <div class="add-new-row">
                                <input type="file" class="import_roleplay_bg" accept="image/*,video/*" />
                                <span class="clean_bg_file">Clean file input</span>
                            </div>
                        </div>
                        <ul class="customized_bg_list">
                        </ul>
                        <h4 class="list-header">Starter list</h4>
                        <ul class="starter_bg_list">
                        </ul>
                    </div>
                </div>
            </div>
            <div class="cait_info-cont" data-tool="cai_tools">
                <div class="cait_info">
                    <div class="caiti_header">
                        <h4>CAI Tools</h4><span class="caiti-close">x</span>
                    </div>
                    <div class="caiti-body">
                    </div>
                </div>
            </div>
        `;
    BODY.appendChild(parseHTML_caiTools(cai_tools_string));

    // SHOW MODAL
    document.querySelector('.cai_tools-btn').addEventListener('mouseup', openModal);
    document.querySelector('.cai_tools-btn').addEventListener('touchstart', openModal);
    async function openModal() {
      const AccessToken = getAccessToken();
      if (!AccessToken) {
        alert("Access Token is not ready yet.");
        return;
      }

      // Add active class to show
      document.querySelector('.cai_tools-cont').classList.add('active');

      // Check if the conversation is already fetched
      let currentConverExtId = await getCurrentConverId();
      const checkExistingConver = document.querySelector(`meta[cai_converExtId="${currentConverExtId}"]`);
      if (checkExistingConver?.getAttribute('cai_conversation') != null) {
        handleProgressInfo('(Ready!)')
        return;
      }
      // If fetch didn't start
      else if (!checkExistingConver?.getAttribute('cai_fetchStarted')) {
        // Set fetch started to prevent re-fetching
        if (checkExistingConver) {
          checkExistingConver.setAttribute('cai_fetchStarted', 'true');
        }
        else {
          const meta = document.createElement('meta');
          meta.setAttribute('cai_converExtId', currentConverExtId);
          meta.setAttribute('cai_fetchStarted', 'true');
          document.head.appendChild(meta);
        }
        // Fetch conversation
        fetchConversation(currentConverExtId);
      }
    }

    // Close CAI Tools modals
    /*[Array.from(document.querySelectorAll('.cait_modal_close'))].forEach(el => {
        el.addEventListener('click', () => {
            el.closest('[data-tool="cai_tools"]').classList.remove('active');
        })
    })*/
    // Universal method
    document.querySelectorAll('.cait_modal_cont').forEach(el => {
      el.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('cait_modal_cont') || target.classList.contains('cait_modal_close')) {
          el.classList.remove('active');
        }
      })
    })


    document.querySelector('.cai_tools-cont').addEventListener('click', (event) => {
      const target = event.target;
      if (target.classList.contains('cai_tools-cont') || target.classList.contains('cait-close')) {
        close_caiToolsModal();
      }
    });


    document.querySelector('.cai_tools-cont').addEventListener('click', (event) => {
      const target = event.target;
      if (target.classList.contains('cai_tools-cont') || target.classList.contains('cait-close')) {
        close_caiToolsModal();
      }
    });
    document.querySelector('.cait_settings-cont').addEventListener('click', (event) => {
      const target = event.target;
      if (target.classList.contains('cait_settings-cont') || target.classList.contains('caits-close')) {
        close_caitSettingsModal();
      }
    });
    document.querySelector('.cait_memory_manager-cont').addEventListener('mousedown', (event) => {
      const target = event.target;
      if (target.classList.contains('cait_memory_manager-cont') || target.classList.contains('caitmm-close')) {
        setTimeout(() => {
          close_caitMemoryManagerModal();
          // To prevent further click by accident, mousedown immediately runs, not when mouse is lifted
        }, 200);
      }
    });
    document.querySelector('.cait_bg_manager-cont').addEventListener('click', (event) => {
      const target = event.target;
      if (target.classList.contains('cait_bg_manager-cont') || target.classList.contains('caitbgm-close')) {
        close_caitBackgroundManagerModal();
      }
    });
    document.querySelector('.cait_info-cont').addEventListener('click', (event) => {
      const target = event.target;
      if (target.classList.contains('cait_info-cont') || target.classList.contains('caiti-close')) {
        close_caitInfoModal();
      }
    });


    // Background manager UI and functionality
    BackgroundManager();
    // Memory manager UI and functionality
    MemoryManager();
    // Font manager UI and functionality
    const fontManagerBody = document.querySelector('.cait_font_manager-cont .cait_modal_body');
    initialize_designtools(fontManagerBody);

    // Features on click
    const importEl = document.querySelector('.cai_tools-cont .cait_import');
    document.querySelector('.cai_tools-cont [data-cait_type="import_a_character"]').addEventListener('click', () => {
      if (!checkPremium()) {
        alert("Premium required.")
        return;
      }
      // Open the file upload
      importEl.click();
    });
    importEl.addEventListener('change', importCharacter);

    document.querySelector('.cai_tools-cont [data-cait_type="background_manager"]').addEventListener('click', () => {
      // Open modal
      const bgManagerCont = document.querySelector('.cait_bg_manager-cont');
      bgManagerCont.classList.add('active');
      close_caiToolsModal();
    });

    document.querySelector('.cai_tools-cont [data-cait_type="font_manager"]').addEventListener('click', () => {
      // Open modal
      const fontManagerCont = document.querySelector('.cait_font_manager-cont');
      fontManagerCont.classList.add('active');
      close_caiToolsModal();
    });

    document.querySelector('.cai_tools-cont [data-cait_type="memory_manager"]').addEventListener('click', () => {
      // Open modal
      const memoryManagerCont = document.querySelector('.cait_memory_manager-cont');
      memoryManagerCont.classList.add('active');
      close_caiToolsModal();
    });

    document.querySelector('.cai_tools-cont [data-cait_type="character_hybrid"]').addEventListener('click', () => {
      const args = { downloadType: 'cai_character_hybrid' };
      DownloadCharacter(args);
      close_caiToolsModal();
    });
    document.querySelector('.cai_tools-cont [data-cait_type="character_card"]').addEventListener('click', () => {
      const args = { downloadType: 'cai_character_card' };
      DownloadCharacter(args);
      close_caiToolsModal();
    });
    document.querySelector('.cai_tools-cont [data-cait_type="character_settings"]').addEventListener('click', () => {
      const args = { downloadType: 'cai_character_settings' };
      DownloadCharacter(args);
      close_caiToolsModal();
    });
    document.querySelector('.cai_tools-cont [data-cait_type="character_copy"]').addEventListener('click', () => {
      const args = { downloadType: 'character_copy' };
      DownloadCharacter(args);
      close_caiToolsModal();
    });

    document.querySelector('.cai_tools-cont [data-cait_type="cai_offline_read"]').addEventListener('click', () => {
      const args = { downloadType: 'cai_offline_read' };
      DownloadConversation(args);
      close_caiToolsModal();
    });
    document.querySelector('.cai_tools-cont [data-cait_type="cai_duplicate_chat"]').addEventListener('click', () => {
      const args = { downloadType: 'cai_duplicate_chat' };
      DownloadConversation(args);
      close_caiToolsModal();
    });
    document.querySelector('.cai_tools-cont [data-cait_type="cai_duplicate_chat_full"]').addEventListener('click', () => {
      const args = { downloadType: 'cai_duplicate_chat_full' };
      DownloadConversation(args);
      close_caiToolsModal();
    });
    document.querySelector('.cai_tools-cont [data-cait_type="oobabooga"]').addEventListener('click', () => {
      const args = { downloadType: 'oobabooga' };
      DownloadConversation(args);
      close_caiToolsModal();
    });
    document.querySelector('.cai_tools-cont [data-cait_type="tavern"]').addEventListener('click', () => {
      const args = { downloadType: 'tavern' };
      DownloadConversation(args);
      close_caiToolsModal();
    });
    document.querySelector('.cai_tools-cont [data-cait_type="example_chat"]').addEventListener('click', () => {
      const args = { downloadType: 'example_chat' };
      DownloadConversation(args);
      close_caiToolsModal();
    });

    document.querySelector('.cai_tools-cont .fetchHistory-btn').addEventListener('click', () => {
      fetchHistory();
    });
    document.querySelector('.cai_tools-cont [data-cait_type="cai_hist_offline_read"]').addEventListener('click', () => {
      const args = { downloadType: 'cai_hist_offline_read' };
      DownloadHistory(args);
      close_caiToolsModal();
    });
  }

  function close_caiToolsModal() {
    document.querySelector('.cai_tools-cont').classList.remove('active');
  }
  function close_caitSettingsModal() {
    document.querySelector('.cait_settings-cont').classList.remove('active');
  }
  function close_caitMemoryManagerModal() {
    document.querySelector('.cait_memory_manager-cont').classList.remove('active');
  }
  function close_caitBackgroundManagerModal() {
    document.querySelector('.cait_bg_manager-cont').classList.remove('active');
  }
  function close_caitInfoModal() {
    document.querySelector('.cait_info-cont').classList.remove('active');
  }
  // CAI Tools - DOM - END



  // CHARACTER IMPORT
  async function importCharacter(e) {
    try {
      close_caiToolsModal();
      // Initialize necessary data
      const AccessToken = getAccessToken();
      const file = e.currentTarget.files[0];
      e.currentTarget.value = ''; // Reset, because if gave an error then it will not "change" when uploading the same file
      const charFields = {};
      let char;
      const location = getPageType();

      // Start informing user
      const infoContainer = document.querySelector('.cait_info-cont');
      const infoBody = infoContainer.querySelector('.caiti-body');
      infoBody.innerHTML = "Extracting character information from file.";
      infoContainer.classList.add('active');

      // Extract data from the character card (png)
      if (file.type === 'image/png') {
        try {
          const tEXt_data = readFromCard(await file.arrayBuffer());
          char = JSON.parse(tEXt_data);
        } catch (error) {
          if (error instanceof JsonParseError)
            throw "Couldn't read character data from the image.";
          else {
            console.log("Character Card Import error, screenshot please: " + error);
            throw "Import error, F12 or Inspect Element -> Console tab -> Report on github please :)";
          }
        }
      } // Extract from json file
      else if (file.type === 'application/json') {
        char = JSON.parse(await file.text());
      }

      charFields.name = char.data?.name ?? char.char_name ?? char.name;
      charFields.title = charFields.name; // (char.data?.personality ?? char.personality ?? "---").substring(0, 50);
      charFields.description = char.data?.description ?? char.description;
      charFields.greeting = (char.data?.first_mes ?? char.first_mes ?? char.char_greeting ?? "Hello!").substring(0, 2048);
      charFields.definition = (char.data?.mes_example ?? char.mes_example ?? char.example_dialogue ?? "").substring(0, 32000);
      charFields.optional_personality = char.data?.personality ?? char.personality ?? char.char_persona ?? "";
      /*charFields.optional_scenario = char.data && char.data.scenario && char.data.scenario.length <= 500
          ? char.data.scenario
          : null;*/

      const nameRegexCAI = RegExp(/^[A-Za-z0-9_-][ A-Za-z0-9_-]*$/i);
      if (!charFields.name) {
        throw "Character name not found.";
      }
      else if (!nameRegexCAI.test(charFields.name)) {
        charFields.name = charFields.name.replace(new RegExp("[^\\w\\s-]", "g"), "-");
      }
      // Separate length check after possible regex check and replace
      if (charFields.name.length < 3) {
        throw "Character name too short.";
      }

      let avatarPayload;
      infoBody.innerHTML = "Checking for avatar...";
      // Get avatar image and convert to upload (base64 | file | blob)
      // If file is already an image, use file as an avatar
      // If not, check if json has any avatar url that needs fetching
      if (file.type === 'image/png' && location === "redesignChat") {
        avatarPayload = await file_blob_To_DataUrl(file);
      }
      else if (file.type === 'image/png') {
        // file for FormData
        avatarPayload = file;
      }
      else if (char.data?.avatar && char.data?.avatar.trim().length > 0) { // Check avatar path
        const imgRes = await fetch(char.data.avatar);
        const imgBlob = await imgRes.blob();
        if (location === "redesignChat") {
          avatarPayload = await file_blob_To_DataUrl(imgBlob);
        } else {
          // blob for FormData
          avatarPayload = imgBlob;
        }
      }

      // More informing
      if (avatarPayload) {
        infoBody.innerHTML = "Uploading avatar to Character.AI...";
      }
      // Upload avatar
      if (avatarPayload && location === "redesignChat") {
        // If it's the new site, use base64 to upload
        const avatarRes = await fetch("https://character.ai/api/trpc/user.uploadAvatar?batch=1", {
          method: "POST",
          headers: {
            "accept": "*/*",
            "content-type": "application/json",
          },
          body: JSON.stringify({ "0": { "json": { "imageDataUrl": avatarPayload } } })
        });
        const avatarData = await avatarRes.json();
        charFields.avatar_rel_path = avatarData[0]?.result?.data?.json ?? "";
      }
      else if (avatarPayload) {
        // If it's the legacy site, use multipart formdata to upload
        const formData = new FormData();
        formData.append("image", avatarPayload)
        const avatarRes = await fetch(`https://${getMembership()}.character.ai/chat/avatar/upload/`, {
          method: "POST",
          headers: {
            "authorization": AccessToken
          },
          body: formData
        });
        const avatarData = await avatarRes.json();
        charFields.avatar_rel_path = avatarData.value ?? "";
      }

      // More informing
      infoBody.innerHTML = "Creating character...";

      // If description is too long to fit in character.ai
      // If there is enough space for description and "\n\n" add it to definition's start
      let descTooLong = false;
      if (charFields.description.length > 500) {
        descTooLong = true;
        const totalLength = charFields.definition.length + charFields.description.length + 4;
        // Cut definition if not they exceed 32k together
        if (totalLength > 32000) {
          charFields.definition = charFields.definition.substring(0, 32000 - charFields.description.length - 4);
        }
        charFields.definition = charFields.description + `\n\n` + charFields.definition;
        // Reset field
        charFields.description = "";
      }

      // If description is set in the definition because it's too long, check personality if it fits in description
      if (descTooLong && charFields.optional_personality.length > 0 && charFields.optional_personality.length <= 500) {
        // Set the personality in the empty description field
        charFields.description = charFields.optional_personality;
      } // Set personality at the top of definition
      else if (charFields.optional_personality.length > 0) {
        const totalLength = charFields.definition.length + charFields.optional_personality.length + 4;
        // Cut definition if not they exceed 32k together
        if (totalLength > 32000) {
          charFields.definition = charFields.definition.substring(0, 32000 - charFields.optional_personality.length - 4);
        }
        charFields.definition = charFields.optional_personality + `\n\n` + charFields.definition;
      }

      // Finally, Create character
      const payload = {
        name: charFields.name.substring(0, 20),
        title: charFields.title.substring(0, 50),
        description: charFields.description.substring(0, 500),
        greeting: charFields.greeting.substring(0, 2048),
        definition: charFields.definition.substring(0, 32000),
        avatar_rel_path: charFields.avatar_rel_path ?? "",
        identifier: "id:" + crypto.randomUUID(),
        categories: [],
        visibility: "PRIVATE",
        copyable: false,
        img_gen_enabled: false,
        base_img_prompt: "",
        strip_img_prompt_from_msg: false,
        voice_id: "",
        default_voice_id: ""
      };
      createCharacter(payload, AccessToken);
    } catch (error) {
      alert("Error: " + error);
      console.log("CAI Tools error: " + error)
    }
  }
  // CHARACTER IMPORT - END


  // BACKGROUND MANAGER
  function BackgroundManager() {
    try {
      const container = document.querySelector('.cait_bg_manager-cont');
      const modal = container.querySelector('.cait_bg_manager');
      const customizedUL = container.querySelector('.customized_bg_list');
      const mainBgCheckbox = container.querySelector('input[name="bgm_main_active"]');
      const roleplayBgCheckbox = container.querySelector('input[name="bgm_roleplay_active"]');
      const mainBgUrlInput = container.querySelector('.main_bg_url');

      populateBackgroundManager();

      function formatKeywords(string) {
        return string.replace(/\s*,\s*/g, ',').trim().toLowerCase();
      }

      container.querySelector('.add_new_bg').addEventListener('click', async () => {
        if (!checkPremium()) {
          alert("Premium required.")
          return;
        }
        // Get values
        const mediaInput = container.querySelector('.import_roleplay_bg');
        const media = mediaInput.files[0];
        const mediaInputUrl = container.querySelector('.import_roleplay_bg_url');
        const mediaUrl = mediaInputUrl.value.trim();
        const keywordInput = container.querySelector('.cait_new_bg_keyword');
        const finalKeywords = formatKeywords(keywordInput.value);

        let finalMedia;
        // Validate keywords field
        if (finalKeywords.length < 1) {
          alert('Keyword field is too short.');
          return;
        }
        // Check media
        if (mediaUrl.length > 0 && await checkUrlIfImageOrVideo(mediaUrl)) {
          finalMedia = mediaUrl;
        }
        else if (media && (media.type.startsWith('image/') || media.type.startsWith('video/'))) {
          finalMedia = await file_blob_To_DataUrl(media);
        }
        else {
          if (mediaUrl.length > 0) {
            alert("URL doesn't provide a media. It needs to be directly linked to a media. Try right click and copy image/video address.");
          } else if (media) {
            alert('Imported file is not an image/gif/video.');
          } else {
            alert('Media is not provided.');
          }
          return;
        }

        // Set
        const args = {
          type: "addUserSelectedBg",
          keywords: finalKeywords.split(','),
          bgImg: finalMedia
        }
        // Add
        caiToolsDB(args, async () => {
          // Reset fields
          mediaInput.value = '';
          keywordInput.value = '';
          mediaInputUrl.value = '';
          // Refresh bg prompt to register new keywords
          apply_bgPrompt();
          // Add to customized bg list in the background manager modal
          const newBg = {
            keywords: args.keywords,
            img: args.bgImg
          }
          customizedUL.innerHTML = await backgroundMediaItem(newBg) + customizedUL.innerHTML;
        });
      });

      // Clean the file input
      container.querySelector('.clean_bg_file').addEventListener('click', async (e) => {
        const mediaInput = container.querySelector('.import_roleplay_bg');
        mediaInput.value = '';
      });

      container.querySelector('.import_main_bg').addEventListener('change', async (e) => {
        if (!checkPremium()) {
          alert("Premium required.")
          return;
        }
        const media = e.currentTarget.files[0];
        // Set
        const args = {
          type: "changeMainBg",
          bgImg: await file_blob_To_DataUrl(media)
        }
        // Add as data url
        caiToolsDB(args, () => {
          // Apply as data url
          apply_custombg(args.bgImg);
        });
      });

      container.querySelector('.main_bg_url_submit').addEventListener('click', async () => {
        if (!checkPremium()) {
          alert("Premium required.")
          return;
        }
        const mediaUrl = mainBgUrlInput.value.trim();
        if (mediaUrl.length > 0 && await checkUrlIfImageOrVideo(mediaUrl)) {
          // Set
          const args = {
            type: "changeMainBg",
            bgImg: mediaUrl
          }
          // Add as link
          caiToolsDB(args, async () => {
            // Apply as link
            apply_custombg(mediaUrl);
            //apply_custombg(await url_To_DataURL(mediaUrl));
          });
        } else {
          alert("URL doesn't provide a media. It needs to be directly linked to a media. Try right click and copy image/video address.");
        }
      });

      mainBgCheckbox.addEventListener('change', (e) => {
        const newStatus = e.currentTarget.checked;
        // Change status
        const args = {
          type: "changeMainBgStatus",
          newStatus
        }
        caiToolsDB(args, async () => {
          // If main bg is deactivated, we don't need to check idb, deactivate it faster
          if (!newStatus) {
            const bg = document.querySelector('BODY #custombg')
            if (bg) {
              bg.style.opacity = '0';
            }

            document.body.classList.remove('custombg-mode');
          } // If activated, get and check main bg settings from idb
          else
            apply_custombg();
        });
      })

      roleplayBgCheckbox.addEventListener('change', (e) => {
        // Change status
        const args = {
          type: "changeRoleplayBgStatus",
          newStatus: e.currentTarget.checked
        }
        caiToolsDB(args, () => {
          // Refresh bg prompt to hide/show box
          apply_bgPrompt();
          // If deactivated, refresh bg
          if (!args.newStatus) {
            apply_custombg();
          }
        });
      })

      modal.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('bg_item_save')) {
          // Get input, get old keywords from the input, get new keywords from the input
          const input = target.parentNode.querySelector('input[data-val]')
          const oldKeywords = input.getAttribute('data-val');
          const newKeywords = formatKeywords(input.value);
          // Trivial validation
          if (newKeywords.length < 1) {
            alert('Keyword field is too short');
            return;
          }
          // Save to idb
          caiToolsDB({
            type: "changeKeyword",
            oldKeywords,
            newKeywords: newKeywords.split(',')
          }, () => {
            // Refresh bg prompt to register new keywords
            apply_bgPrompt();
            // Update old keywords
            input.setAttribute('data-val', newKeywords);
            alert("Keywords updated successfully");
          })
        }
        else if (target.classList.contains('bg_item_delete')) {
          // Get input, get keywords from the input
          const input = target.parentNode.querySelector('input[data-val]')
          const keywords = input.getAttribute('data-val');
          // Delete from idb
          caiToolsDB({
            type: "removeRoleplayBackground",
            keywords
          }, () => {
            // Refresh bg prompt to exclude deleted one
            apply_bgPrompt();
            // Remove from modal
            target.closest('li').remove();
          })
        }
      })
    } catch (error) {
      alert("Error: " + error);
      console.log("CAI Tools error: " + error)
    }
  }

  function populateBackgroundManager() {
    const container = document.querySelector('.cait_bg_manager-cont');
    if (!container) return;
    const customizedUL = container.querySelector('.customized_bg_list');
    const starterUL = container.querySelector('.starter_bg_list');
    const mainBgCheckbox = container.querySelector('input[name="bgm_main_active"]');
    const roleplayBgCheckbox = container.querySelector('input[name="bgm_roleplay_active"]');
    if (!customizedUL || !starterUL || !mainBgCheckbox || !roleplayBgCheckbox) return;
    caiToolsDB({ type: "getBgSettings" }, (data) => {
      const settings = data.settings;
      // Checkboxes
      mainBgCheckbox.checked = settings.mainBgActive;
      roleplayBgCheckbox.checked = settings.roleplayBgActive;
      // Backgrounds
      const generateAndSetHTML = async (items, targetElement) => {
        // reverse to show new imgs first
        targetElement.innerHTML = (await Promise.all(items.reverse().map(backgroundMediaItem))).join('');
      };

      generateAndSetHTML(settings.userSelected, customizedUL);
      generateAndSetHTML(settings.starter, starterUL);
    });
  }

  async function backgroundMediaItem(item) {
    const imgData = await getMediaDataFromUrl(item.img);
    return `
            <li>
                <div class="bg_item_actions">
                    <input data-val="${item.keywords.join(',')}" value="${item.keywords.join(',')}" class="bg_item_keyword" type="text" placeholder="keyword,keyword" />
                    <span class="bg_item_save">Save</span>
                    <span class="bg_item_delete">Delete</span>
                </div>
                <div class="bgimg-cont">
                    ${imgData ? `
                        ${imgData.mimeType.startsWith('video/')
          ? `<video muted loop controls loading="lazy"><source src="${imgData.media}" type="${imgData.mimeType}"></video>`
          : `<img src="${imgData.media}" loading="lazy" />`}
                    ` : `
                        <span>Image link is no longer viable(can be temporary)${item.img.startsWith('http') ? ': ' + item.img : ''}</span>
                    `}
                </div>
            </li>
        `
  }
  // BACKGROUND MANAGER - END


  // MEMORY MANAGER
  function MemoryManager() {
    try {
      const container = document.querySelector('.cait_memory_manager-cont');
      // Memory manager settings
      const mmActive = container.querySelector('input[name="cait_mm_active"]');
      const remindFrequency = container.querySelector('input[name="remind_frequency"]');
      // Memory managing
      const newMemoryField = container.querySelector('.mm_new_memory');
      const addNewMemoryBtn = container.querySelector('.add_new_memory');
      const currentMemoryList = container.querySelector('.mm-current_memory_list');
      // Save / Cancel
      const cancelPlan = container.querySelector('.cancel');
      const savePlan = container.querySelector('.save');
      // Push to memory list
      const pushToMemoryList = (memory) => {
        const li = document.createElement('li');
        const textarea = document.createElement('textarea');
        textarea.classList.add('memory');
        textarea.value = memory;
        const deleteBtn = document.createElement('button');
        deleteBtn.type = "button";
        deleteBtn.classList.add('delete_memory');
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener('click', () => li.remove())
        li.appendChild(textarea);
        li.appendChild(deleteBtn);
        currentMemoryList.appendChild(li);
      }

      // Get settings from storage
      const defaultSettings = {
        mmActive: false,
        mmRemindFrequency: 5,
        mmList: [
          /* Example
          {
              char: "ZYoXQIapG7SNgYRl6lKFbFhsU9IF5hWNBgP2DtT7GKk",
              timesSkipped: 0,
              list: [
                  "ZYoXQIapG7SNgYRl6lKFbFhsU9IF5hWNBgP2DtT7GKk Hello, this is the id of this characters. Be careful."
              ]
          }*/
        ]
      }

      // Initialize settings
      let caiToolsSettings = JSON.parse(localStorage.getItem('cai_tools'));
      if (!caiToolsSettings) {
        caiToolsSettings = {
          memoryManager: defaultSettings
        }
      }
      else if (!caiToolsSettings.memoryManager) {
        caiToolsSettings.memoryManager = defaultSettings;
      }
      const settings = caiToolsSettings.memoryManager;

      // Import settings
      if (container.dataset.import_needed === "true") {
        mmActive.checked = settings.mmActive;
        remindFrequency.value = settings.mmRemindFrequency >= 0 ? settings.mmRemindFrequency : 5;
        // Import existing memory list and some error handling
        if (!settings.mmList) settings.mmList = [];
        const charId = getCharId();
        if (!charId) throw "Char ID is undefined";
        const charSettings = settings.mmList.find(obj => obj.char === charId);
        if (charSettings) {
          // Clean up and append
          currentMemoryList.innerHTML = "";
          charSettings.list.forEach(pushToMemoryList);
        } else {
          settings.mmList.push({
            char: charId,
            timesSkipped: 0,
            list: []
          });
        }
        // Prevent import the second time
        container.dataset.import_needed = "false";
      }

      // Add new memory
      addNewMemoryBtn.addEventListener('click', () => {
        if (newMemoryField.value.trim().length === 0) return;
        pushToMemoryList(newMemoryField.value.trim());
        newMemoryField.value = "";
      });

      // Cancel
      cancelPlan.addEventListener('click', () => {
        // Import from settings the next time
        container.dataset.import_needed = "true";
        close_caitMemoryManagerModal();
      });

      // Save
      savePlan.addEventListener('click', () => {
        try {
          // Save the options
          settings.mmActive = mmActive.checked;
          settings.mmRemindFrequency = +remindFrequency.value >= 0 && +remindFrequency.value < 100 ? +remindFrequency.value : 5;
          // Choose the specific character from the settings
          const charId = getCharId();
          if (!charId) throw "Char ID is undefined";
          let charSettings = settings.mmList.find(obj => obj.char === charId);
          if (!charSettings) {
            // Unlikely to enter
            charSettings = {
              char: charId,
              timesSkipped: 0,
              list: []
            }
          }
          // Clean up the memory list
          charSettings.list = [];
          // Save memories from the inputs
          [...currentMemoryList.children].forEach(li => {
            const memory = li.querySelector('textarea').value.trim();
            if (memory.length > 0) {
              const charSettings = settings.mmList.find(obj => obj.char === charId);
              charSettings.list.push(memory);
            }
          });
          // Save to local storage for persistent data
          try {
            localStorage.setItem('cai_tools', JSON.stringify(caiToolsSettings));
          } catch (error) {
            // If localStorage quota exceeded, clear localStorage, remove the previous character settings and keep this one
            if (error instanceof DOMException && (
              error.name === 'QuotaExceededError' ||
              error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
              error.name === 'NS_ERROR_DOM_QUOTA_REACHED_ERR'
            )) {
              localStorage.clear();
              settings.mmList = [charSettings];
              localStorage.setItem('cai_tools', JSON.stringify(caiToolsSettings));
            } else {
              throw error;
            }
          }
          // Close the modal
          close_caitMemoryManagerModal();
        } catch (error) {
          console.log("Screenshot this error please; ", error);
          alert("Couldn't be saved. Check console for error using F12 and Console tab, then please report on github.");
        }
      });
    } catch (error) {
      console.log("Screenshot this error please; ", error);
      alert("Memory manager couldn't be opened. Please create an issue in Github with the error in the console. F12 > Console tab")
    }
  }
  // MEMORY MANAGER - END



  // CONVERSATION
  async function DownloadConversation(args) {
    const currentConversation = await getCurrentConverId();
    if (!currentConversation) {
      alert("Current conversation ID couldn't be found.")
      return;
    }
    const chatData =
      JSON.parse(document.querySelector(`meta[cai_converExtId="${currentConversation}"]`)?.getAttribute('cai_conversation') || 'null');
    if (chatData == null) {
      alert("Data doesn't exist or not ready. Try again later.")
      return;
    }

    const charName = chatData[0]?.name ?? "NULL!";

    switch (args.downloadType) {
      case "cai_offline_read":
        Download_OfflineReading(chatData);
        break;
      case "cai_duplicate_chat":
        DuplicateChat(chatData, 100);
        break;
      case "cai_duplicate_chat_full":
        DuplicateChat(chatData);
        break;
      case "oobabooga":
        if (charName === "NULL!") {
          alert("Character name couldn't be found!");
          return;
        }
        DownloadConversation_Oobabooga(chatData, charName);
        break;
      case "tavern":
        if (charName === "NULL!") {
          alert("Character name couldn't be found!");
          return;
        }
        DownloadConversation_Tavern(chatData, charName);
        break;
      case "example_chat":
        if (charName === "NULL!") {
          alert("Character name couldn't be found!");
          return;
        }
        DownloadConversation_ChatExample(chatData, charName);
        break;
      default:
        break;
    }
  }



  async function DuplicateChat(chatData, maxMsgLength) {
    try {
      // Trim the chatData for faster job, optionally
      if (maxMsgLength) {
        // Get last X messages
        chatData = chatData.slice(-maxMsgLength);
      }

      // Get all necessary data
      console.log("Cloning:", chatData);
      const charId = getCharId();
      const userInfo = await getUserId({ withUsername: true });
      if (!userInfo || !charId) {
        alert("Requirements missing, can't proceed to duplication.");
        return;
      }
      const { userId, username } = userInfo;


      // Deactivate memory manager before duplication
      // because it will intercept the duplicated messages and add the memories
      let caiToolsSettings = JSON.parse(localStorage.getItem('cai_tools'));
      if (caiToolsSettings && caiToolsSettings.memoryManager) {
        caiToolsSettings.memoryManager.mmActive = false;
        localStorage.setItem('cai_tools', JSON.stringify(caiToolsSettings))
      }
      // Initialize link here
      let newChatPage = null;
      let newChatPage_Redesign = null;
      // Create new connection
      const socket = new WebSocket("wss://neo.character.ai/ws/");
      let msgIndex = 0;
      // For back to back messages, we need the last message info
      let prevThisTurnId = "";
      let prevHumanTurnId = "";
      // For persisting origin id, for whatever it is
      const randomOriginId = crypto.randomUUID();
      // Store chat id
      let chatId = "";
      let abortedReqs = [];

      // Start informing user
      const infoContainer = document.querySelector('.cait_info-cont');
      const infoBody = infoContainer.querySelector('.caiti-body');
      infoBody.innerHTML = "Creating new chat...";
      infoContainer.classList.add('active');
      let chatIsCreated = false;

      // On socket open
      const sendCreateChatMessage = () => {
        // Create new chat2
        const createChatPayload = {
          "command": "create_chat",
          "request_id": crypto.randomUUID(),
          "payload": {
            "chat": {
              "chat_id": crypto.randomUUID(),
              "creator_id": userId.toString(),
              "visibility": "VISIBILITY_PRIVATE",
              "character_id": charId,
              "type": "TYPE_ONE_ON_ONE"
            },
            "with_greeting": true
          },
          "origin_id": randomOriginId
        }
        socket.send(JSON.stringify(createChatPayload));
      }
      // Check if the socket is already open
      if (socket.readyState === 1) {
        sendCreateChatMessage();
      } else if (socket.readyState === 0) {
        // Add event listener for the "open" event
        socket.addEventListener("open", () => {
          sendCreateChatMessage();
        });
      } else {
        throw "Socket readyState is not 0 or 1, it's: " + socket.readyState;
      }

      // Handle chat creation error when trying to connect to websocket
      socket.addEventListener("error", (event) => {
        if (!chatIsCreated) {
          alert('Error when trying to create new chat.');
          console.log("CAI Tools error: " + event);
        }
      });

      // Handle incoming messages
      socket.addEventListener("message", (event) => {
        if (!event.data) return;
        const wsdata = JSON.parse(event.data);
        // console.log(wsdata);

        // We need to wait after create_chat_response and get the greeting message
        // From that message, we will get the ids that we will use to send message
        // turn.primary_candidate_id to get update_primary_candidate.candidate_id
        // turn.turn_key.turn_id to get update_primary_candidate.candidate_id.turn_id
        if (wsdata.command === "create_chat_response") {
          if (!wsdata.chat || !wsdata.chat.character_id || !wsdata.chat.chat_id) {
            alert("New chat requirements missing, can't proceed to duplication.");
            return;
          }
          chatId = wsdata.chat.chat_id;
          // Store to give user later
          newChatPage = `https://old.character.ai/chat2?char=${charId}&hist=${chatId}`;
          newChatPage_Redesign = `https://character.ai/chat/${charId}?hist=${chatId}`;
          console.log(newChatPage, newChatPage_Redesign);
          chatIsCreated = true;
        }
        else if (wsdata.command === "remove_turns_response") {
          // Remove means previous message was the user as well, so we have to delete it and send message
          // Get necessary data
          const msg = chatData[msgIndex];
          const thisTurnId = crypto.randomUUID();

          // Update info
          infoBody.innerHTML = `<p>Recreating messages from scratch ${msgIndex}/${chatData.length}</p>`;

          msgIndex++; // Increase the index to get next msg in line

          const sendUserMessageAgainPayload = {
            "command": "create_and_generate_turn",
            "request_id": crypto.randomUUID(),
            "payload": {
              "num_candidates": 1,
              "tts_enabled": false,
              "selected_language": "",
              "character_id": charId,
              "user_name": username,
              "turn": {
                "turn_key": {
                  "turn_id": thisTurnId,
                  "chat_id": chatId
                },
                "author": {
                  "author_id": userId.toString(),
                  "is_human": true,
                  "name": username
                },
                "candidates": [{
                  "candidate_id": thisTurnId,
                  "raw_content": msg.message
                }],
                "primary_candidate_id": thisTurnId
              },
              "previous_annotations": {
                "boring": 0,
                "not_boring": 0,
                "inaccurate": 0,
                "not_inaccurate": 0,
                "repetitive": 0,
                "not_repetitive": 0,
                "out_of_character": 0,
                "not_out_of_character": 0,
                "bad_memory": 0,
                "not_bad_memory": 0,
                "long": 0,
                "not_long": 0,
                "short": 0,
                "not_short": 0,
                "ends_chat_early": 0,
                "not_ends_chat_early": 0,
                "funny": 0,
                "not_funny": 0,
                "interesting": 0,
                "not_interesting": 0,
                "helpful": 0,
                "not_helpful": 0
              },
              "update_primary_candidate": {
                "candidate_id": prevHumanTurnId,
                "turn_key": {
                  "turn_id": prevHumanTurnId,
                  "chat_id": chatId
                }
              }
            },
            "origin_id": randomOriginId
          };
          socket.send(JSON.stringify(sendUserMessageAgainPayload));
        }
        else if (wsdata.command === "add_turn" || wsdata.command === "update_turn") {
          // Aborting sometimes deletes unexpectedly, I will skip aborting for now
          // Abort once if it's CHAR's "update" to get response as fast as we can
          // Note: aborting add_turn results in complete message delete and thus duplication failure
          if (false && !wsdata.turn.candidates[0].is_final
            && !wsdata.turn.author.is_human
            && !abortedReqs.includes(wsdata.request_id)
            && wsdata.command === "update_turn") {
            // Use request_id of the update_turn
            const abortPayload = {
              "command": "abort_generation",
              "request_id": wsdata.request_id,
              "origin_id": randomOriginId
            };
            socket.send(JSON.stringify(abortPayload));
            // Add to aborted request to not abort again
            abortedReqs.push(wsdata.request_id);
            return;
          }
          else if (!wsdata.turn.candidates[0].is_final) return; // Ignore updates and take final one
          else if (wsdata.turn.author.is_human) {
            // Save the last human turn id to continue from there in case it's back to back human messages
            prevHumanTurnId = wsdata.turn.primary_candidate_id;
            return;
          }
          else if (msgIndex >= chatData.length) {
            // Stop if the original chat came to an end
            // And update the info modal with link
            infoBody.innerHTML = `
                            <p>
                                Complete! Duplicate chat;
                                <br /><br />
                                <a href="${newChatPage}" target="_blank">Old design chat link</a>
                                <br /><br />
                                <a href="${newChatPage_Redesign}" target="_blank">Redesign chat link</a>
                            </p>
                        `;
            return
          };

          // Get necessary data
          const msg = chatData[msgIndex];
          const prevMsgWasHuman = chatData[msgIndex - 1] ? chatData[msgIndex - 1].isHuman ?? false : null;

          const thisTurnId = crypto.randomUUID();
          prevThisTurnId = thisTurnId;
          // These are required to follow up the previous message
          const turnKey = wsdata.turn.turn_key.turn_id;
          const candidateId = wsdata.turn.primary_candidate_id;

          // Update info
          if (!infoContainer.classList.contains('active')) {
            infoContainer.classList.add('active');
          }
          infoBody.innerHTML = `<p>Recreating messages from scratch ${msgIndex}/${chatData.length}</p>`;

          // If msg is human and previous wasn't human, send message
          if (msg.isHuman && !prevMsgWasHuman) {
            msgIndex++; // Increase the index to get next msg in line
            const sendUserMessagePayload = {
              "command": "create_and_generate_turn",
              "request_id": crypto.randomUUID(),
              "payload": {
                "num_candidates": 1,
                "tts_enabled": false,
                "selected_language": "",
                "character_id": charId,
                "user_name": username,
                "turn": {
                  "turn_key": {
                    "turn_id": thisTurnId,
                    "chat_id": chatId
                  },
                  "author": {
                    "author_id": userId.toString(),
                    "is_human": true,
                    "name": username
                  },
                  "candidates": [{
                    "candidate_id": thisTurnId,
                    "raw_content": msg.message
                  }],
                  "primary_candidate_id": thisTurnId
                },
                "previous_annotations": {
                  "boring": 0,
                  "not_boring": 0,
                  "inaccurate": 0,
                  "not_inaccurate": 0,
                  "repetitive": 0,
                  "not_repetitive": 0,
                  "out_of_character": 0,
                  "not_out_of_character": 0,
                  "bad_memory": 0,
                  "not_bad_memory": 0,
                  "long": 0,
                  "not_long": 0,
                  "short": 0,
                  "not_short": 0,
                  "ends_chat_early": 0,
                  "not_ends_chat_early": 0,
                  "funny": 0,
                  "not_funny": 0,
                  "interesting": 0,
                  "not_interesting": 0,
                  "helpful": 0,
                  "not_helpful": 0
                },
                "update_primary_candidate": {
                  "candidate_id": candidateId,
                  "turn_key": {
                    "turn_id": turnKey,
                    "chat_id": chatId
                  }
                }
              },
              "origin_id": randomOriginId
            };
            socket.send(JSON.stringify(sendUserMessagePayload));
          }
          else if (msg.isHuman && prevMsgWasHuman) {
            // If msg is human and previous was human, delete this char reply and send message that we receive with remove_turns_response
            const deleteCharMessagePayload = {
              "command": "remove_turns",
              "request_id": crypto.randomUUID(),
              "payload": {
                "chat_id": wsdata.turn.turn_key.chat_id,
                "turn_ids": [turnKey]
              },
              "origin_id": randomOriginId
            };
            socket.send(JSON.stringify(deleteCharMessagePayload));
          }
          else if (!msg.isHuman && prevMsgWasHuman === false && wsdata.turn.candidates.length > 1) {
            // If msg is from character and previous wasn't human, basically continue the char reply
            // NOTE: if prevMsgWasHuman is null, it's the first message and we don't come here
            // ...if it's false, it's continuation and comes here
            // NOTE 2: We know differentiate this from editing with candidate length, if it's more than one, it means editing is done
            const generateCharMessagePayload = {
              "command": "create_and_generate_turn",
              "request_id": crypto.randomUUID(),
              "payload": {
                "num_candidates": 1,
                "tts_enabled": false,
                "selected_language": "",
                "character_id": charId,
                "user_name": username,
                "turn": {
                  "turn_key": {
                    "turn_id": thisTurnId,
                    "chat_id": chatId
                  },
                  "author": {
                    "author_id": userId.toString(),
                    "is_human": true,
                    "name": username
                  },
                  "candidates": [
                    {
                      "candidate_id": thisTurnId,
                      "raw_content": ""
                    }
                  ],
                  "primary_candidate_id": thisTurnId
                },
                "previous_annotations": {
                  "boring": 0,
                  "not_boring": 0,
                  "inaccurate": 0,
                  "not_inaccurate": 0,
                  "repetitive": 0,
                  "not_repetitive": 0,
                  "out_of_character": 0,
                  "not_out_of_character": 0,
                  "bad_memory": 0,
                  "not_bad_memory": 0,
                  "long": 0,
                  "not_long": 0,
                  "short": 0,
                  "not_short": 0,
                  "ends_chat_early": 0,
                  "not_ends_chat_early": 0,
                  "funny": 0,
                  "not_funny": 0,
                  "interesting": 0,
                  "not_interesting": 0,
                  "helpful": 0,
                  "not_helpful": 0
                }
              },
              "origin_id": randomOriginId
            };
            socket.send(JSON.stringify(generateCharMessagePayload));
          }
          else {
            msgIndex++; // Increase the index to get next msg in line
            // If msg is char, edit the reply received just now
            const editCharMessagePayload = {
              "command": "edit_turn_candidate",
              "request_id": crypto.randomUUID(),
              "payload": {
                "turn_key": {
                  "chat_id": wsdata.turn.turn_key.chat_id,
                  "turn_id": turnKey
                },
                "current_candidate_id": wsdata.turn.candidates[0].candidate_id,
                "new_candidate_raw_content": msg.message
              },
              "origin_id": randomOriginId
            };
            socket.send(JSON.stringify(editCharMessagePayload));
          }
        }
        else {
          console.log("WS Data:", wsdata);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }





  function DownloadConversation_Oobabooga(chatData, charName) {
    const ChatObject = {
      internal: [],
      visible: [],
      data: [],
      data_visible: [],
    };

    let currentPair = [];
    let prevName = null;

    // User's message first
    chatData.shift();

    chatData.forEach((msg) => {
      // If the current messager is the same as the previous one, merge and skip this iteration
      if (msg.name === prevName) {
        const dataLength = ChatObject.internal.length - 1;
        const pairLength = ChatObject.internal[dataLength].length - 1;

        let mergedMessage = ChatObject.internal[dataLength][pairLength] += "\n\n" + msg.message;
        ChatObject.internal[dataLength][pairLength] = mergedMessage;
        ChatObject.visible[dataLength][pairLength] = mergedMessage;
        ChatObject.data[dataLength][pairLength] = mergedMessage;
        ChatObject.data_visible[dataLength][pairLength] = mergedMessage;
        return;
      }

      // If the current messager is different, push to currentPair
      currentPair.push(msg.message);

      // If currentPair has 2 messages, push to ChatObject and reset
      if (currentPair.length === 2) {
        ChatObject.internal.push(currentPair);
        ChatObject.visible.push(currentPair);
        ChatObject.data.push(currentPair);
        ChatObject.data_visible.push(currentPair);
        currentPair = [];
      }

      // Update the previous messager's name
      prevName = msg.name;
    });

    const Data_FinalForm = JSON.stringify(ChatObject);
    const blob = new Blob([Data_FinalForm], { type: 'text/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${charName}_oobabooga_Chat.json`;
    link.click();
  }

  function DownloadConversation_Tavern(chatData, charName) {
    const blob = CreateTavernChatBlob(chatData, charName);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${charName}_tavern_Chat.jsonl`;
    link.click();
  }

  function DownloadConversation_ChatExample(chatData, charName) {
    const messageList = [];

    messageList.push("<START>");
    chatData.forEach(msg => {
      const messager = msg.name == charName ? "char" : "user";
      const message = `{{${messager}}}: ${msg.message}`;
      messageList.push(message);
    });

    const definitionString = messageList.join("\n");

    const blob = new Blob([definitionString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${charName}_Example.txt`;
    link.click();
  }

  function CreateTavernChatBlob(chatData, charName) {
    const userName = 'You';
    const createDate = Date.now();
    const initialPart = JSON.stringify({
      user_name: userName,
      character_name: charName,
      create_date: createDate,
    });
    const outputLines = [initialPart];

    let prevName = null;
    chatData.forEach((msg) => {
      // If the current messager is the same as the previous one, merge and skip this iteration
      if (msg.name === prevName) {
        let mergedMessage = JSON.parse(outputLines[outputLines.length - 1]);
        mergedMessage.mes += "\n\n" + msg.message;
        outputLines[outputLines.length - 1] = JSON.stringify(mergedMessage);
        return;
      }

      const formattedMessage = JSON.stringify({
        name: msg.name !== charName ? "You" : charName,
        is_user: msg.name !== charName,
        is_name: true,
        send_date: Date.now(),
        mes: msg.message
      });

      outputLines.push(formattedMessage);

      // Update the previous messager's name
      prevName = msg.name;
    });

    const outputString = outputLines.join('\n');

    return new Blob([outputString], { type: 'application/jsonl' });
  }



  // HISTORY

  function DownloadHistory(args) {
    const charId = getCharId();
    const historyData =
      JSON.parse(document.querySelector('meta[cai_charId="' + charId + '"]')?.getAttribute('cai_history') || 'null');

    if (historyData == null) {
      alert("Data doesn't exist or not ready. Try again later.")
      return;
    }

    const charName = historyData[0]?.[0]?.name ?? "NULL!";

    const dtype = args.downloadType;
    switch (dtype) {
      case "cai_hist_offline_read":
        Download_OfflineReading(historyData);
        break;
      case "example_chat":
        if (charName === "NULL!") {
          alert("Character name couldn't be found!");
          return;
        }
        DownloadHistory_ExampleChat(historyData, charName);
        break;
      case "cai_tavern_history":
        if (charName === "NULL!") {
          alert("Character name couldn't be found!");
          return;
        }
        DownloadHistory_TavernHistory(historyData, charName);
        break;
      default:
        break;
    }
  }


  async function Download_OfflineReading(data) {
    let default_character_name = data[0]?.name ?? data[data.length - 1]?.chat[0]?.name ?? data[0]?.chat[0]?.name;
    if (!default_character_name) {
      alert("Couldn't get the character's name");
    }
    const charPicture = await getAvatar('80', 'char');
    const userPicture = await getAvatar('80', 'user');

    let offlineHistory = [];

    if (Array.isArray(data[0].chat)) {
      // This is from history
      data.forEach(chat => {
        const chatTemp = [];
        chat.chat.forEach(msg => chatTemp.push({ isUser: msg.isHuman, name: msg.name, message: encodeURIComponent(msg.message) }));
        offlineHistory.push({ date: chat.date, chat: chatTemp });
      });
    } else {
      // This is from conversation
      const chatTemp = [];
      data.forEach(msg => chatTemp.push({ isUser: msg.isHuman, name: msg.name, message: encodeURIComponent(msg.message) }));
      offlineHistory.push({ date: data[0].date, chat: chatTemp });
    }

    const finalData = {
      charPic: charPicture,
      userPic: userPicture,
      history: offlineHistory
    }

    var fileUrl = `${extensionUrl}ReadOffline.html`;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', fileUrl, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        var fileContents = xhr.responseText;
        fileContents = fileContents.replace(
          '<<<REPLACE_THIS_TEXT>>>',
          JSON.stringify(finalData)
        );

        var blob = new Blob([fileContents], { type: 'text/html' });
        var url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = default_character_name ? default_character_name.replaceAll(' ', '_') + '_Offline.html' : 'Offline_Chat.html';
        link.click();
      }
    };
    xhr.send();
  }

  function DownloadHistory_ExampleChat(historyData, character_name) {
    const messageList = [];

    historyData.forEach(chat => {
      messageList.push("<START>");
      chat.forEach(msg => {
        const messager = msg.name == character_name ? "char" : "user";
        const message = `{{${messager}}}: ${msg.message}`;
        messageList.push(message);
      });
    });

    const definitionString = messageList.join("\n");

    const blob = new Blob([definitionString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = character_name.replaceAll(' ', '_') + '_Example.txt';
    link.click();
  }


  function DownloadHistory_TavernHistory(historyData, character_name) {
    const char_id = getCharId();
    const zip = new JSZip();
    let count = 0;

    const filePromises = historyData.map(async (chat, index) => {
      count = index + 1;
      const blob = CreateTavernChatBlob(chat, character_name);
      const arraybuffer = await readAsBinaryString(blob);
      zip.file(`chat_${index + 1}.jsonl`, arraybuffer, { binary: true });
    });

    Promise.all(filePromises).then(() => {
      if (count === 0) {
        alert("History have no messages.");
        return;
      }
      zip.generateAsync({ type: 'blob' }).then(function (content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = character_name != null
          ? `${character_name}_TavernHistory.zip`
          : `${char_id.substring(0, 8)}.zip`;
        link.click();
      });
    });
  }

  function readAsBinaryString(blob) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = function (event) {
        resolve(event.target.result);
      };
      reader.readAsBinaryString(blob);
    });
  }
  //HISTORY - END




  // CHARACTER DOWNLOAD

  function DownloadCharacter(args) {
    const fetchUrl = `https://${getMembership()}.character.ai/chat/character/`;
    const AccessToken = getAccessToken();
    const charId = getCharId();
    const payload = { external_id: charId }
    if (AccessToken != null && charId != null) {
      fetchCharacterInfo(fetchUrl, AccessToken, payload, args.downloadType);
    }
    else {
      alert("Couldn't find logged in user or character id.");
    }
  }

  function fetchCharacterInfo(fetchUrl, AccessToken, payload, downloadType) {
    fetch(fetchUrl, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        "authorization": AccessToken
      },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        //Permission check
        if (!data.character || data.character.length === 0) {
          // No permission because it's someone else's character
          // /chat/character/info/ instead of /chat/character/ fixes that
          const newUrl = `https://${getMembership()}.character.ai/chat/character/info/`;
          // To guarantee running once
          if (fetchUrl != newUrl) {
            console.log("Trying other character fetch method...");
            fetchCharacterInfo(newUrl, AccessToken, payload, downloadType);
          }
          return;
        }

        // Get character info
        let { name, title, description, greeting, avatar_file_name, definition, categories } = data.character;

        if (downloadType === "cai_character_hybrid") {
          const hybridCharacter = {
            char_name: name,
            char_persona: description,
            char_greeting: greeting,
            world_scenario: "",
            example_dialogue: definition ?? "",

            name: name,
            description: description,
            first_mes: greeting,
            scenario: "",
            mes_example: definition ?? "",
            personality: title,

            metadata: metadata
          }

          const Data_FinalForm = JSON.stringify(hybridCharacter);
          const blob = new Blob([Data_FinalForm], { type: 'text/json' });
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = name.replaceAll(' ', '_') + '.json';
          link.click();
        }
        else if (downloadType === "cai_character_card") {
          if (avatar_file_name == null ||
            avatar_file_name == "" ||
            avatar_file_name.length == 0
          ) {
            alert("Only works on characters who have an avatar.")
            return;
          }

          const cardCharacter = {
            name: name,
            description: description,
            first_mes: greeting,
            scenario: "",
            mes_example: definition ?? "",
            personality: title,

            metadata: metadata
          }

          const avatarLink = `https://characterai.io/i/400/static/avatars/${avatar_file_name}`;

          const charInfo = JSON.stringify(cardCharacter, undefined, '\t');

          fetch(avatarLink)
            .then(res => res.blob())
            .then(avifBlob => {
              const img = new Image();
              const objectURL = URL.createObjectURL(avifBlob);
              img.src = objectURL;

              img.onload = function () {
                // Create a canvas element
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw the AVIF image onto the canvas
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                // Convert canvas content to PNG Blob
                canvas.toBlob(canvasBlob => {
                  const fileReader = new FileReader();
                  fileReader.onload = function (event) {
                    const chunks = extractChunks(new Uint8Array(event.target.result)).filter(x => x.name !== 'tEXt');

                    // Create new tEXt chunk
                    const keyword = [99, 104, 97, 114, 97]; // "chara" in ASCII
                    const encodedValue = btoa(new TextEncoder().encode(charInfo).reduce((a, b) => a + String.fromCharCode(b), ''));
                    const valueBytes = [];
                    for (let i = 0; i < encodedValue.length; i++) {
                      valueBytes.push(encodedValue.charCodeAt(i));
                    }
                    const tEXtChunk = {
                      name: 'tEXt',
                      data: new Uint8Array([...keyword, 0, ...valueBytes])
                    };

                    // Find the index of 'IEND'
                    const iendIndex = chunks.findIndex(obj => obj.name === 'IEND');

                    // Insert the new tEXt before 'IEND'
                    chunks.splice(iendIndex, 0, tEXtChunk);

                    // Combine
                    const combinedData = [];
                    // Signature
                    combinedData.push(...[137, 80, 78, 71, 13, 10, 26, 10]);
                    chunks.forEach(chunk => {
                      const length = chunk.data.length;
                      const lengthBytes = new Uint8Array(4);
                      lengthBytes[0] = (length >> 24) & 0xFF;
                      lengthBytes[1] = (length >> 16) & 0xFF;
                      lengthBytes[2] = (length >> 8) & 0xFF;
                      lengthBytes[3] = length & 0xFF;

                      const type = chunk.name.split('').map(char => char.charCodeAt(0));

                      const crc = CRC32.buf(chunk.data, CRC32.str(chunk.name));

                      const crcBytes = new Uint8Array(4);
                      crcBytes[0] = (crc >> 24) & 0xFF;
                      crcBytes[1] = (crc >> 16) & 0xFF;
                      crcBytes[2] = (crc >> 8) & 0xFF;
                      crcBytes[3] = crc & 0xFF;

                      combinedData.push(...lengthBytes, ...type, ...chunk.data, ...crcBytes);
                    });

                    // Download
                    const newDataBlob = new Blob([new Uint8Array(combinedData).buffer], { type: 'image/png' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(newDataBlob);
                    link.download = name ?? 'character_card.png';
                    link.click();
                  };
                  fileReader.readAsArrayBuffer(canvasBlob);
                }, "image/png");
              };
            })
            .catch(err => {
              console.error('Error while fetching avatar.');
            });
        }
        else if (downloadType === "cai_character_settings") {
          const avatarLink = avatar_file_name && avatar_file_name.length > 0
            ? `https://characterai.io/i/400/static/avatars/${avatar_file_name}`
            : null;

          // Populate
          const settingsContent = `
                        <span class="caits_field_name">Name</span>
                        <p>${name}</p>
                        <span class="caits_field_name">Short Description</span>
                        <p>${title}</p>
                        <span class="caits_field_name">Long Description</span>
                        <p>${description.trim().length === 0 ? '(Empty)' : description}</p>
                        <span class="caits_field_name">Greeting</span>
                        <p>${parseMessageText(greeting)}</p>
                        <span class="caits_field_name">Avatar Link</span>
                        <p>${avatarLink ? `<a href="${avatarLink}" target="_blank">${avatarLink}</a>` : '(No avatar)'}</p>
                        <span class="caits_field_name">Definition</span>
                        <p>${definition == null ? '(Definition is set to private and impossible to get.)' : definition.trim().length === 0 ? '(Empty)' : parseMessageText(definition)}</p>
                    `;

          // Container
          const settingsContainer = document.querySelector(".cait_settings .caits-content");
          if (!settingsContainer) return; // Not necessary
          settingsContainer.innerHTML = settingsContent;
          settingsContainer.closest('.cait_settings-cont').classList.add('active');
        }
        else if (downloadType === "character_copy") {
          const payload = {
            title: title,
            name: name,
            identifier: "id:" + crypto.randomUUID(),
            categories: categories ? categories.map(c => c.name) : [],
            visibility: "PRIVATE",
            copyable: false,
            description: description,
            greeting: greeting,
            definition: definition ?? "",
            avatar_rel_path: avatar_file_name,
            img_gen_enabled: false,
            base_img_prompt: "",
            strip_img_prompt_from_msg: false,
            voice_id: "",
            default_voice_id: ""
          };
          createCharacter(payload, AccessToken);
        }
      })
      .catch(err => console.log(err));
  }

  // CHARACTER DOWNLOAD - END


  // UTILITY

  function caiToolsDB(args, callback) {
    // Inform the user about error
    function dbOnError(e) {
      alert("Error when working with IndexedDB. Error code: " + e.target.errorCode);
      console.error("CAI Tools IndexedDB error: " + e.target.errorCode + " - " + e.target.error);
    }
    // Open db
    const dbreq = window.indexedDB.open(idbName, idbVersion);
    dbreq.onerror = dbOnError;
    // Initialize db
    dbreq.onupgradeneeded = caiToolsDB_onupgradeneeded;

    dbreq.onsuccess = (e) => {
      // Get db instance
      const db = e.target.result;
      // Get settings object store
      const transaction = db.transaction(["settings"], "readwrite");
      const objectStore = transaction.objectStore("settings");
      // If actions are related to design tools
      if (args && (args.type === "getDesignSettings" || args.type === "saveDesignSettings")) {
        // Get the settings for design tools from settings object store
        const getRequest = objectStore.get("designTools");
        getRequest.onerror = dbOnError;
        getRequest.onsuccess = (event) => {
          const data = event.target.result;
          if (!data) return;
          // Run the callback with the setting data for initialization
          if (args.type === "getDesignSettings") {
            callback(data);
          } // Save the settings to DB for the future sessions
          else if (args.type === "saveDesignSettings") {
            if (args.fontSize) data.settings.fontSize = args.fontSize;
            if (args.fontStyle) data.settings.fontStyle = args.fontStyle;
            // Save action
            const requestUpdate = objectStore.put(data);
            requestUpdate.onerror = dbOnError;
            requestUpdate.onsuccess = (e) => {
            };
          }
        };
      } // If actions related to background
      else if (args && (
        args.type === "getBgSettings" ||
        args.type === "addUserSelectedBg" ||
        args.type === "getMainBg" ||
        args.type === "changeMainBg" ||
        args.type === "changeMainBgStatus" ||
        args.type === "changeRoleplayBgStatus" ||
        args.type === "changeKeyword" ||
        args.type === "removeRoleplayBackground" ||
        args.type === "getKeywordList" ||
        args.type === "getRoleplayBg")) {
        // Get the lists from background object store
        const getRequest = objectStore.get("background");
        getRequest.onerror = dbOnError;
        getRequest.onsuccess = (event) => {
          const data = event.target.result;
          if (!data) return;

          function getAllKeywords() {
            // get all the keywords as a set
            return new Set([
              ...data.settings.userSelected.flatMap(obj => args && obj.keywords.join(',') === args.exclude ? undefined : obj.keywords).filter(k => k !== undefined),
              ...data.settings.starter.flatMap(obj => args && obj.keywords.join(',') === args.exclude ? undefined : obj.keywords).filter(k => k !== undefined)
            ]);
          }
          function checkDuplicateKeywwords(keywords, args) {
            const allKeywords = getAllKeywords();
            // check if any of the keywords array elements equal exists in the set
            const hasDuplicates = keywords.some(keyword => allKeywords.has(keyword));
            return hasDuplicates;
          }

          // Run the callback with the background data
          if (args.type === "getBgSettings") {
            callback(data);
          }
          // Get all keywords
          else if (args.type === "getKeywordList") {
            const status = data.settings.roleplayBgActive;
            if (!status) {
              callback(false);
            } else {
              const allKeywords = getAllKeywords();
              callback(allKeywords);
            }
          }
          // Add an image inside 
          else if (args.type === "addUserSelectedBg") {
            // Check if there are any duplicate keys
            if (checkDuplicateKeywwords(args.keywords)) {
              alert("The keyword(s) are already in use by other images.")
              return;
            }
            // Add new background item
            const newBg = {
              keywords: args.keywords,
              img: args.bgImg
            }
            data.settings.userSelected.push(newBg);
            // Save action
            const requestUpdate = objectStore.put(data);
            requestUpdate.onerror = dbOnError;
            requestUpdate.onsuccess = (e) => {
              callback();
            };
          }
          // Get the main background settings
          else if (args.type === "getMainBg") {
            callback({
              mainBg: data.settings.main,
              mainBgActive: data.settings.mainBgActive
            });
          }
          // Change the main background image
          else if (args.type === "changeMainBg") {
            data.settings.main = args.bgImg;
            // Save action
            const requestUpdate = objectStore.put(data);
            requestUpdate.onerror = dbOnError;
            requestUpdate.onsuccess = (e) => {
              callback();
            };
          }
          // Change the main background image
          else if (args.type === "changeMainBgStatus" || args.type === "changeRoleplayBgStatus") {
            if (args.type === "changeMainBgStatus") {
              data.settings.mainBgActive = args.newStatus;
            } else {
              data.settings.roleplayBgActive = args.newStatus;
            }

            // Save action
            const requestUpdate = objectStore.put(data);
            requestUpdate.onerror = dbOnError;
            requestUpdate.onsuccess = (e) => {
              callback();
            };
          }
          // Alter the keywords of a background
          else if (args.type === "changeKeyword") {
            // args.newKeywords is array
            // args.oldKeywords is string
            let oldItem = data.settings.userSelected.find(obj => obj.keywords.join(',') == args.oldKeywords);
            if (!oldItem) {
              oldItem = data.settings.starter.find(obj => obj.keywords.join(',') == args.oldKeywords);
            }
            if (!oldItem) {
              alert("Couldn't find the item's old state.")
              return;
            }
            // Check if new keywords exist (also exclude the old item)
            if (checkDuplicateKeywwords(args.newKeywords, { exclude: oldItem.keywords.join(',') })) {
              alert("The keyword(s) are already in use by other images.")
              return;
            }
            // Save new keywords
            oldItem.keywords = args.newKeywords;
            const requestUpdate = objectStore.put(data);
            requestUpdate.onerror = dbOnError;
            requestUpdate.onsuccess = (e) => {
              callback();
            };
          }
          // Delete backgrounds by keywords
          else if (args.type === "removeRoleplayBackground") {
            data.settings.userSelected = data.settings.userSelected.filter(obj => obj.keywords.join(',') !== args.keywords);
            data.settings.starter = data.settings.starter.filter(obj => obj.keywords.join(',') !== args.keywords);
            // Save filtered version
            const requestUpdate = objectStore.put(data);
            requestUpdate.onerror = dbOnError;
            requestUpdate.onsuccess = (e) => {
              callback();
            };
          }
          // Get roleplay background by a keyword
          else if (args.type === "getRoleplayBg") {
            let item = data.settings.userSelected.find(obj => obj.keywords.includes(args.keyword));
            if (!item) {
              item = data.settings.starter.find(obj => obj.keywords.includes(args.keyword));
            }
            callback(item);
          }
        }
      }
    };
  }

  function caiToolsDB_onupgradeneeded(e) {
    try {
      const db = e.target.result;
      const oldVersion = e.oldVersion;
      const newVersion = e.newVersion;

      if (oldVersion < 1) {
        // Create object store during first initialization
        const objectStore = db.createObjectStore('settings', { keyPath: "code" });

        objectStore.transaction.oncomplete = async (event) => {
          const default_designTools = {
            fontSize: '16',
            fontStyle: 'default'
          }
          const default_background = {
            mainBgActive: false,
            roleplayBgActive: false,
            main: null,
            userSelected: [],
            starter: []
          }

          // Get the starter pack of images and keywords
          const bgStarterLink = `${extensionUrl}assets/bgStarter.json`;
          const bgStarterRes = await fetch(bgStarterLink);
          const bgStarter = await bgStarterRes.json();
          default_background.starter = bgStarter;

          // Store values in the newly created objectStore.
          const dtStore = db
            .transaction("settings", "readwrite")
            .objectStore("settings");
          dtStore.add({ code: "designTools", settings: default_designTools });
          dtStore.add({ code: "background", settings: default_background });
        };
      }
    } catch (error) {
      console.log(error)
    }
  };

  async function getPatreonPledgeInfo(patreonCode) {

    let redirectURI;
    if (getSiteVersion() !== 'unknown') {
      redirectURI = 'https://' + window.location.hostname + '/'
    }

    return new Promise((resolve, reject) => {
      resolve({ status: "paid", daysLeft: 1e309 })
      fetch(`https://api.caitools.info/get-pledge-info?code=${patreonCode}${redirectURI ? `&redirect=${redirectURI}` : ''}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      })
        .then(res => res.json())
        .then(data => {
          if (!data.status)
            reject("Status is not returned from the server. Error: " + data.error)
          else
            resolve(data)
        })
        .catch(err => {
          reject(err)
        });
    })
  }

  function createCharacter(payload, AccessToken) {
    const infoContainer = document.querySelector('.cait_info-cont');
    const infoBody = infoContainer.querySelector('.caiti-body');

    fetch(`https://${getMembership()}.character.ai/chat/character/create/`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        "authorization": AccessToken
      },
      body: JSON.stringify(payload)
    })
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then((data) => {
        if (!data.character || !data.character.external_id) {
          if (data.error)
            throw data.error;
          throw "External id is not returned";
        }
        // Inform the user
        infoBody.innerHTML = `
                    <p>
                        Your private character;
                        <br /><br />
                        <a href="https://old.character.ai/chat2?char=${data.character.external_id}" target="_blank">Old design link</a>
                        <br /><br />
                        <a href="https://character.ai/chat/${data.character.external_id}" target="_blank">Redesign link</a>
                        <br /><br />
                        <span>Note: Due to platform differences, some fields will adapt to Character.AI and won't be the same. You could further adjust it to perfection.</span>
                    </p>
                `;
        infoContainer.classList.add('active');
      })
      .catch(err => {
        alert("Error while creating character: " + err)
        infoContainer.classList.remove('active');
        console.log(err)
      });
  }

  function handleProgressInfo(text) {
    const progressInfo = document.querySelector('.cai_tools-cont .cait_progressInfo');
    if (progressInfo) progressInfo.textContent = text;
  }
  function handleProgressInfoHist(text) {
    const progressInfo = document.querySelector('.cai_tools-cont .cait_progressInfo_Hist');
    if (progressInfo) progressInfo.textContent = text;
  }

  function cleanDOM() {
    // Remove all instances of cai tools
    document.querySelectorAll('[data-tool="cai_tools"]').forEach(element => {
      element.remove();
    });
  }

  async function getUserId(settings = { withUsername: false }) {
    const AccessToken = getAccessToken();
    if (!AccessToken) return null;
    return await fetch(`https://${getMembership()}.character.ai/chat/user/`, {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        "authorization": AccessToken
      }
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        if (!data?.user?.user?.id) {
          return null;
        }
        if (settings.withUsername) {
          return {
            userId: data.user.user.id,
            username: data.user.user.account.name
          };
        }
        else {
          return { userId: data.user.user.id };
        }
      })
      .catch(err => {
        console.log("Error while fetching user Id;", err)
        return null;
      });
  }

  async function getAvatar(avatarSize, identity) {
    // 80 / 400 - avatarSize
    // char / user - identity
    return new Promise(async (resolve, reject) => {
      try {
        const AccessToken = getAccessToken();
        const fetchUrl = identity === 'char' ? `https://${getMembership()}.character.ai/chat/character/info/` : `https://${getMembership()}.character.ai/chat/user/`;
        const settings = identity === 'char' ? {
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "authorization": AccessToken
          },
          body: JSON.stringify({ external_id: getCharId() })
        } : {
          method: "GET",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "authorization": AccessToken
          }
        }

        if (!AccessToken) {
          resolve(null);
        }

        const response = await fetch(fetchUrl, settings);
        if (!response.ok) {
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
        const data = await response.json();
        const avatarPath = identity === 'char' ? data.character?.avatar_file_name ?? null : data.user?.user?.account?.avatar_file_name ?? null;

        if (avatarPath == null || avatarPath == "") {
          resolve(null);
        } else {
          const avatarLink = `https://characterai.io/i/${avatarSize}/static/avatars/${avatarPath}`;
          const avatarResponse = await fetch(avatarLink);
          if (!avatarResponse.ok) {
            throw new Error(`Failed to fetch avatar. Status: ${avatarResponse.status}`);
          }
          const avifBlob = await avatarResponse.blob();

          // Create a FileReader to read the blob as a base64 string
          const reader = new FileReader();

          reader.onload = function () {
            // The result property contains the base64 string
            const base64String = reader.result;
            resolve(base64String);
          };

          reader.onerror = function (error) {
            reject(error);
          };

          // Read the blob as data URL (base64)
          reader.readAsDataURL(avifBlob);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  function getCharId() {
    const location = getPageType();
    // If new design
    if (location === 'redesignChat') {
      // path only: /chat/[charId]
      return window.location.pathname.split('/')[2];
    }
    // If legacy
    else {
      // path with query string: /chat?char=[charId]
      const url = new URL(window.location.href);
      const searchParams = new URLSearchParams(url.search);
      const charId = searchParams.get('char');
      return charId;
    }
  }

  // Get the "identification" of a page
  function getPageType() {
    // Examples:
    // character.ai/chat
    // *.character.ai/chat2
    // *.character.ai/chat
    // *.character.ai/
    const location = window.location.hostname + '/' + window.location.pathname.split('/')[1];
    const searchParams = new URLSearchParams(window.location.search);

    if (location === 'character.ai/chat') {
      return "redesignChat";
    }
    // If chat2
    else if (location.includes('.character.ai/chat2')) {
      return "chat2Chat";
    }
    // If legacy chat
    else if (location.includes('.character.ai/chat') && searchParams.get('char')) {
      return "legacyChat";
    }
    // If main page
    else if (window.location.hostname.includes('.character.ai') && window.location.pathname === "/") {
      return "oldMainPage"
    }
    // If main page
    else if (window.location.pathname === "/") {
      return "mainPage"
    }
    return null;
  }

  function getSiteVersion() {
    const location = window.location.hostname;
    switch (location) {
      case 'beta.character.ai':
        return 'beta'
      case 'plus.character.ai':
        return 'plus'
      case 'old.character.ai':
        return 'old'
      case 'character.ai':
        return 'redesign'
      default:
        return 'unknown'
    }
  }


  // Get the progress info from cai tools box, such as "(Ready!)" or "(Loading...)"
  function getProgressInfo() {
    return document.querySelector('.cai_tools-cont .cait_progressInfo')?.textContent;
  }

  function getMembership() {
    if (window.location.hostname === "character.ai") {
      return "plus"
    } else if (window.location.hostname === "old.character.ai") {
      return "old"
    }
    return window.location.hostname.indexOf("plus") > -1 ? "plus" : "beta";
  }

  function checkPremium() {
    const val = getCookie('cait_premium');
    return val ? val === "unlocked" ? 2 : 1 : null;
  }

  function getAccessToken() {
    const meta = document.querySelector('meta[cai_token]');
    return meta ? meta.getAttribute('cai_token') : null;
  }

  async function getCurrentConverId() {
    try {
      // Get necessary info
      const AccessToken = getAccessToken();
      const charId = getCharId();
      if (!AccessToken || !charId) {
        return null;
      }

      const url = new URL(window.location.href);
      const searchParams = new URLSearchParams(url.search);
      const location = getPageType();

      // If history id is in the query strings
      const historyId = searchParams.get('hist');
      if (historyId) {
        return historyId;
      }
      // If user opened the recent chat, and if the page new design or chat2
      else if (location === 'redesignChat' || location === "chat2Chat") {
        const res = await fetch(`https://neo.character.ai/chats/recent/${charId}`, {
          method: "GET",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "authorization": AccessToken
          }
        })
        if (res.ok) {
          const data = await res.json();
          return data.chats[0].chat_id;
        }
      }
      // If legacy recent
      else {
        const res = await fetch(`https://${getMembership()}.character.ai/chat/history/continue/`, {
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "authorization": AccessToken
          },
          body: JSON.stringify({
            character_external_id: charId,
            history_external_id: null
          })
        })
        if (res.ok) {
          const data = await res.json();
          return data.external_id;
        }
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  function parseHTML_caiTools(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    var content = template.content;

    //Allows user to drag the button.
    makeDraggable(content.querySelector('.cait_button-cont'));

    //Three taps on dragger will remove the cai tools button.
    const handleTapToDisable = (() => {
      let tapCount = 0;
      let tapTimer;

      function resetTapCount() {
        tapCount = 0;
      }

      return function () {
        tapCount++;
        if (tapCount === 1) {
          tapTimer = setTimeout(resetTapCount, 700); // Adjust the time window for detecting fast taps (in milliseconds)
        } else if (tapCount === 3) {
          // Three taps occurred quickly
          cleanDOM();
          clearTimeout(tapTimer); // Clear the timer if three taps are reached
        }
      };
    })();
    content.querySelector(".dragCaitBtn").addEventListener("mouseup", handleTapToDisable);
    content.querySelector(".dragCaitBtn").addEventListener("touchstart", handleTapToDisable);

    return content;
  }

  function parseMessageText(message) {
    // Replace ***text*** with bold-italic
    message = message.replace(/\*\*\*([\s\S]*?)\*\*\*/g, '<span class="bold-italic">$1</span>');
    // Replace **text** with bold
    message = message.replace(/\*\*([\s\S]*?)\*\*/g, '<span class="bold">$1</span>');
    // Replace *text* with italic
    message = message.replace(/\*([\s\S]*?)\*/g, '<span class="italic">$1</span>');
    // Replace newline (\n) with line break (<br>)
    message = message.replace(/\n/g, '<br>');
    return message;
  }

  function setCookie(cname, cvalue, exdays) {
    if (!exdays || exdays < 1) exdays = 0;
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  }

  function makeDraggable(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.querySelector(".dragCaitBtn")) {
      // if present, the header is where you move the DIV from:
      document.querySelector(".dragCaitBtn").addEventListener("mousedown", dragMouseDown);
      document.querySelector(".dragCaitBtn").addEventListener("touchstart", dragMouseDown);
    } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      elmnt.addEventListener("mousedown", dragMouseDown);
      elmnt.addEventListener("touchstart", dragMouseDown);
    }

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
      pos4 = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
      document.addEventListener("mouseup", closeDragElement);
      document.addEventListener("touchend", closeDragElement);
      // call a function whenever the touch/mouse cursor moves:
      document.addEventListener("mousemove", elementDrag);
      document.addEventListener("touchmove", elementDrag);
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - (e.type === "touchmove" ? e.touches[0].clientX : e.clientX);
      pos2 = pos4 - (e.type === "touchmove" ? e.touches[0].clientY : e.clientY);
      pos3 = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
      pos4 = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;
      // set the element's new position:
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
      // stop moving when mouse button is released:
      document.removeEventListener("mouseup", closeDragElement);
      document.removeEventListener("touchend", closeDragElement);
      document.removeEventListener("mousemove", elementDrag);
      document.removeEventListener("touchmove", elementDrag);
    }
  }

  async function checkUrlIfImageOrVideo(url) {
    return new Promise((resolve, reject) => {
      try {
        let element;
        const videoExtensions = [".mp4", ".webm", ".ogg", ".avi", ".mov", ".wmv", ".flv", ".mkv"];
        const lowerCaseUrl = url.toLowerCase();
        if (videoExtensions.some(ext => lowerCaseUrl.endsWith(ext))) {
          element = document.createElement('video');
          element.onloadedmetadata = function () {
            resolve(true);
          }
          element.onerror = function () {
            resolve(false);
          }
          element.src = url;
        } else {
          element = new Image();
          element.onload = function () {
            if (this.width > 0) resolve(true);
            else resolve(false);
          }
          element.onerror = function () {
            resolve(false);
          }
          element.src = url;
        }
      } catch (error) {
        reject(error);
      }
    })
  }

  async function file_blob_To_DataUrl(data) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => {
        resolve(null);
        console.log("CAI Tools error on file_blob_To_DataUrl: " + error);
      };
      if (data instanceof File)
        reader.readAsDataURL(new Blob([data], { type: data.type }));
      else
        reader.readAsDataURL(data);
    });
  }

  async function urlToObjectURL(url) {
    //const blob = await fetch(`data:${type};base64,${base64String}`).then(response => response.blob());
    const blob = await fetch(url).then(response => response.blob());
    return URL.createObjectURL(blob);
  }

  async function url_To_DataURL(url) {
    try {
      const blob = await fetch(url).then(response => response.blob());
      return file_blob_To_DataUrl(blob);
    } catch (error) {
      return null;
    }
  }

  function getMimeTypeFromDataUrl(dataUrl) {
    return dataUrl.substring(dataUrl.indexOf(":") + 1, dataUrl.indexOf(";"));
  }

  async function video_to_ObjectUrl(data) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onload = () => {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(new Blob([reader.result], { type: data.type }));
        video.onloadedmetadata = () => {
          resolve(video.src);
        };
      };
      reader.onerror = (error) => {
        resolve(null);
        console.log("CAI Tools error on video_to_ObjectUrl: " + error);
      };
      reader.readAsArrayBuffer(data);
    });
  }


  /*function removeSpecialChars(str) {
      return str
          .replace(/[\\]/g, ' ')
          .replace(/[\"]/g, ' ')
          .replace(/[\/]/g, ' ')
          .replace(/[\b]/g, ' ')
          .replace(/[\f]/g, ' ')
          .replace(/[\n]/g, ' ')
          .replace(/[\r]/g, ' ')
          .replace(/[\t]/g, ' ');
  };*/








  // Source: https://github.com/hughsk/png-chunks-extract
  var uint8 = new Uint8Array(4)
  var int32 = new Int32Array(uint8.buffer)
  var uint32 = new Uint32Array(uint8.buffer)
  function extractChunks(data) {
    if (data[0] !== 0x89) throw new Error('Invalid .png file header')
    if (data[1] !== 0x50) throw new Error('Invalid .png file header')
    if (data[2] !== 0x4E) throw new Error('Invalid .png file header')
    if (data[3] !== 0x47) throw new Error('Invalid .png file header')
    if (data[4] !== 0x0D) throw new Error('Invalid .png file header: possibly caused by DOS-Unix line ending conversion?')
    if (data[5] !== 0x0A) throw new Error('Invalid .png file header: possibly caused by DOS-Unix line ending conversion?')
    if (data[6] !== 0x1A) throw new Error('Invalid .png file header')
    if (data[7] !== 0x0A) throw new Error('Invalid .png file header: possibly caused by DOS-Unix line ending conversion?')

    var ended = false
    var chunks = []
    var idx = 8

    while (idx < data.length) {
      // Read the length of the current chunk,
      // which is stored as a Uint32.
      uint8[3] = data[idx++]
      uint8[2] = data[idx++]
      uint8[1] = data[idx++]
      uint8[0] = data[idx++]

      // Chunk includes name/type for CRC check (see below).
      var length = uint32[0] + 4
      var chunk = new Uint8Array(length)
      chunk[0] = data[idx++]
      chunk[1] = data[idx++]
      chunk[2] = data[idx++]
      chunk[3] = data[idx++]

      // Get the name in ASCII for identification.
      var name = (
        String.fromCharCode(chunk[0]) +
        String.fromCharCode(chunk[1]) +
        String.fromCharCode(chunk[2]) +
        String.fromCharCode(chunk[3])
      )

      // The IHDR header MUST come first.
      if (!chunks.length && name !== 'IHDR') {
        throw new Error('IHDR header missing')
      }

      // The IEND header marks the end of the file,
      // so on discovering it break out of the loop.
      if (name === 'IEND') {
        ended = true
        chunks.push({
          name: name,
          data: new Uint8Array(0)
        })

        break
      }

      // Read the contents of the chunk out of the main buffer.
      for (var i = 4; i < length; i++) {
        chunk[i] = data[idx++]
      }

      // Read out the CRC value for comparison.
      // It's stored as an Int32.
      uint8[3] = data[idx++]
      uint8[2] = data[idx++]
      uint8[1] = data[idx++]
      uint8[0] = data[idx++]

      var crcActual = int32[0]
      var crcExpect = CRC32.buf(chunk)
      if (crcExpect !== crcActual) {
        throw new Error(
          'CRC values for ' + name + ' header do not match, PNG file is likely corrupted'
        )
      }

      // The chunk data is now copied to remove the 4 preceding
      // bytes used for the chunk name/type.
      var chunkData = new Uint8Array(chunk.buffer.slice(4))

      chunks.push({
        name: name,
        data: chunkData
      })
    }

    if (!ended) {
      throw new Error('.png file ended prematurely: no IEND header was found')
    }

    return chunks
  }

  // ZoltanAI | character-editor | https://github.com/ZoltanAI/character-editor
  function readFromCard(arrayBuffer) {
    const chunks = readChunks(new Uint8Array(arrayBuffer));

    const text = chunks.filter(c => c.type === 'tEXt').map(c => decodeText(c.data));
    if (text.length < 1) throw "No PNG text fields found in file";

    const chara = text.find(t => t.keyword === 'chara');
    if (chara === undefined) throw "No PNG text field named chara found in file";

    try {
      return new TextDecoder().decode(Uint8Array.from(atob(chara.text), c => c.charCodeAt(0)));
    } catch (e) {
      throw new PngInvalidCharacterError('Unable to parse "chara" field as base64', {
        cause: e
      });
    }
  }
  function readChunks(data) {
    if (data[0] !== 0x89 || data[1] !== 0x50 || data[2] !== 0x4E || data[3] !== 0x47 || data[4] !== 0x0D || data[5] !== 0x0A || data[6] !== 0x1A || data[7] !== 0x0A) throw new PngFormatError('Invalid PNG header');

    const chunks = [];

    let idx = 8; // Skip signature
    while (idx < data.length) {
      const chunk = readChunk(data, idx);

      if (!chunks.length && chunk.type !== 'IHDR') throw 'PNG missing IHDR header';

      chunks.push(chunk);
      idx += 4 + 4 + chunk.data.length + 4; // Skip length, chunk type, chunk data, CRC
    }

    if (chunks.length === 0) throw 'PNG ended prematurely, no chunks';
    if (chunks[chunks.length - 1].type !== 'IEND') throw 'PNG ended prematurely, missing IEND header';

    return chunks;
  }
  function readChunk(data, idx) {
    // Read length field
    uint8[3] = data[idx++];
    uint8[2] = data[idx++];
    uint8[1] = data[idx++];
    uint8[0] = data[idx++];
    const length = uint32[0];

    // Read chunk type field
    const chunkType = String.fromCharCode(data[idx++]) + String.fromCharCode(data[idx++]) + String.fromCharCode(data[idx++]) + String.fromCharCode(data[idx++]);

    // Read chunk data field
    const chunkData = data.slice(idx, idx + length);
    idx += length;

    // Read CRC field
    uint8[3] = data[idx++];
    uint8[2] = data[idx++];
    uint8[1] = data[idx++];
    uint8[0] = data[idx++];
    const crc = int32[0];

    // Compare stored CRC to actual
    if (crc !== CRC32.buf(chunkData, CRC32.str(chunkType))) throw "CRC for " + chunkType + " header is invalid, file is likely corrupted'";

    return {
      type: chunkType,
      data: chunkData,
      crc
    };
  }
  function decodeText(data) {
    let naming = true;
    let keyword = '';
    let text = '';

    for (let index = 0; index < data.length; index++) {
      const code = data[index];

      if (naming) {
        if (code) {
          keyword += String.fromCharCode(code);
        } else {
          naming = false;
        }
      } else {
        if (code) {
          text += String.fromCharCode(code);
        } else {
          throw 'Invalid NULL character found in PNG tEXt chunk';
        }
      }
    }

    return {
      keyword,
      text
    };
  }
})();
