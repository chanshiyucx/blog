this.fileObj = this.$refs.file.files[0]
const files = this.files
const video = document.createElement('video')
video.preload = 'metadata'
video.onloadedmetadata = function() {
  window.URL.revokeObjectURL(video.src)
  const duration = video.duration
}
video.src = URL.createObjectURL(this.fileObj)
