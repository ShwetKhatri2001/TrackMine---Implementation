App = {
  loading: false,

  render: async () => {
    if (App.loading) {
      return;
    }
    $("#account").html(App.account);
    await App.listMyTenders();
    await App.listBidsOnTenders();
  },

  listMyTenders: async () => {
    const tenderCount = await App.TenderAuction.tenderCount();
    for (i = 1; i <= tenderCount; i++) {
      const tender = await App.TenderAuction.tenders(i);
      console.log("tender", tender);
      if (tender[4] === App.account) {
        const tenderTemplate = `<tr style="text-align:center">
                                            <td>${tender[0]}</td>
                                            <td>${tender[1]}</td>
                                            <td>${tender[3]}</td>
                                        </tr>`;
        $("#mytenders").append(tenderTemplate);
      }
    }
  },

  listBidsOnTenders: async () => {
    const bidCount = await App.TenderAuction.bidCount();
    for (i = 1; i <= bidCount; i++) {
      const bid = await App.TenderAuction.bids(i);
      console.log("bid", bid);
      if (bid?.tenderBy === App.account) {
        const bidTemplate = `<tr style="text-align:center">
                                            <td>${bid[0]}</td>
                                            <td>${bid[3]}</td>
                                            <td>${bid[4]}</td>
                                            <td>
                                        </tr>`;
        $("#myBids").append(bidTemplate);
      }
    }
  },

  submitTender: async () => {
    App.setLoading(true);
    const itemName = $("#itemName").val();
    const itemDesc = $("#itemDesc").val();
    const itemQuantity = $("#itemQuantity").val();

    try {
      await App.TenderAuction.createTender(itemName, itemDesc, itemQuantity, {
        from: App.account,
      });
      window.location.reload();
    } catch {
      window.location.reload();
    }
  },

  setLoading: (boolean) => {
    App.loading = boolean;
    const loader = $("#loading");
    const content = $("#content");
    if (boolean) {
      loader.show();
      content.hide();
    } else {
      loader.hide();
      content.show();
    }
  },
};

function uploadTenders() {
  $("#tenderList").hide();
  $("#bidList").hide();
  $("#uploadTender").show();
}

function showTenders() {
  $("#bidList").hide();
  $("#uploadTender").hide();
  $("#tenderList").show();
}

function showBids() {
  $("#uploadTender").hide();
  $("#tenderList").hide();
  $("#bidList").show();
}
