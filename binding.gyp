{
  "targets": [
    {
      "target_name": "node_printer",
      "sources": [
        "src/node_printer.cpp"
      ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ],
      "conditions": [
        ["OS=='linux'", {
          "libraries": [
            "-lcups"
          ]
        }],
        ["OS=='win'", {
          "libraries": [
            "winspool.lib"
          ]
        }]
      ]
    }
  ]
}
