export const clubFactoryAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "club",
        type: "address",
      },
    ],
    name: "ClubCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_uri",
        type: "string",
      },
      {
        internalType: "address",
        name: "_application",
        type: "address",
      },
    ],
    name: "createClubAndSendEther",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];
