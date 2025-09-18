// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "TrickleFaucet",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "TrickleFaucet",
            targets: ["TrickleFaucet"]),
    ],
    dependencies: [
        // WalletConnect Swift SDK
        .package(url: "https://github.com/WalletConnect/WalletConnectSwiftV2", from: "1.9.0"),
        // Web3 Swift for Ethereum interactions
        .package(url: "https://github.com/argentlabs/web3.swift", from: "1.6.0"),
        // BigInt for handling large numbers
        .package(url: "https://github.com/attaswift/BigInt", from: "5.3.0"),
    ],
    targets: [
        .target(
            name: "TrickleFaucet",
            dependencies: [
                .product(name: "WalletConnect", package: "WalletConnectSwiftV2"),
                .product(name: "Web3Modal", package: "WalletConnectSwiftV2"),
                .product(name: "Web3", package: "web3.swift"),
                .product(name: "BigInt", package: "BigInt"),
            ]),
        .testTarget(
            name: "TrickleFaucetTests",
            dependencies: ["TrickleFaucet"]),
    ]
)