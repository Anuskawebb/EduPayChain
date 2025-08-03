import { Web3Storage } from 'web3.storage'
import { WEB3_STORAGE_TOKEN } from './config'

// Initialize Web3.Storage client
const client = WEB3_STORAGE_TOKEN ? new Web3Storage({ token: WEB3_STORAGE_TOKEN }) : null

export interface CertificateMetadata {
  name: string
  description: string
  image?: string
  attributes: Array<{
    trait_type: string
    value: string
  }>
}

export const uploadToIPFS = async (metadata: CertificateMetadata): Promise<string> => {
  if (!client) {
    console.warn('Web3.Storage token not configured, using mock IPFS URI')
    return `ipfs://mock-${Date.now()}/metadata.json`
  }

  try {
    // Create a file from the metadata
    const file = new File([JSON.stringify(metadata, null, 2)], 'metadata.json', {
      type: 'application/json',
    })

    // Upload to IPFS
    const cid = await client.put([file])
    const ipfsUri = `ipfs://${cid}/metadata.json`
    
    console.log('Uploaded to IPFS:', ipfsUri)
    return ipfsUri
  } catch (error) {
    console.error('Error uploading to IPFS:', error)
    // Fallback to mock URI
    return `ipfs://mock-${Date.now()}/metadata.json`
  }
}

export const generateCertificateMetadata = (
  studentName: string,
  course: string,
  university: string,
  date: string
): CertificateMetadata => {
  return {
    name: `Certificate - ${studentName}`,
    description: `Certificate for ${studentName} in ${course} at ${university}`,
    image: "https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=800",
    attributes: [
      {
        trait_type: "Student Name",
        value: studentName
      },
      {
        trait_type: "Course",
        value: course
      },
      {
        trait_type: "University",
        value: university
      },
      {
        trait_type: "Issue Date",
        value: date
      }
    ]
  }
}